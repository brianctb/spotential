import json
import logging
from typing import Literal, Optional
import anthropic
from anthropic import beta_async_tool
from anthropic.types.beta import BetaMessage
from config.business_type import BusinessType, BUSINESS_CONFIGS
from schema.agent import AgentMessage, AgentLocationResult, AgentChatResponse
from schema.geography import GeographyResolution
from service.PredictionService import PredictionService
from service.CensusService import CensusService
from service.GeographyService import GeographyService

logger = logging.getLogger("uvicorn")

MAX_TOOL_ITERATIONS = 4

SYSTEM_PROMPT = (
    "You are Spotential's location assistant. You help users find good places to open "
    "a business in Metro Vancouver, BC — including Vancouver, Burnaby, Richmond, "
    "Surrey, and other Lower Mainland municipalities — using real census and "
    "business-density data. Only discuss locations and business types you have tools "
    "for. When a user names more than one city or neighbourhood, put every one of "
    "them into the tool call's city/neighbourhood array, not just the first. Always "
    "use full names for state and country (e.g. 'British Columbia', not 'BC'; "
    "'Canada'). Keep replies to 2-3 sentences — the UI shows structured result cards "
    "separately, don't restate them as prose."
)

MODEL = "claude-haiku-4-5-20251001"

TOOL_RESOLVE_BUSINESS_TYPE = "resolve_business_type"
TOOL_FIND_TOP_LOCATIONS = "find_top_locations"


def _build_tool_schemas(
    supported_cities: list[str],
    supported_states: list[str],
    supported_countries: list[str],
) -> tuple[dict, dict]:
    resolve_business_type_schema = {
        "type": "object",
        "properties": {
            "business_type": {
                "type": "string",
                "enum": [bt.value for bt in BusinessType],
                "description": "The closest matching supported business type.",
            }
        },
        "required": ["business_type"],
        "additionalProperties": False,
    }
    find_top_locations_schema = {
        "type": "object",
        "properties": {
            "business_type": {"type": "string", "enum": [bt.value for bt in BusinessType]},
            "limit": {
                "type": "integer",
                "minimum": 1,
                "maximum": 5,
                "description": "How many locations to return (max 5).",
            },
            "order": {
                "type": "string",
                "enum": ["desc", "asc"],
                "description": "desc = best opportunity first.",
            },
            "city": {
                "type": "array",
                "items": {"type": "string", "enum": supported_cities},
                "description": "Every city the user named, e.g. ['Vancouver', 'Burnaby'].",
            },
            "neighbourhood": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Every neighbourhood the user named, e.g. ['Kitsilano', 'Yaletown'].",
            },
            "state": {
                "type": "string",
                "enum": supported_states,
                "description": "Full province/state name, e.g. 'British Columbia'.",
            },
            "country": {
                "type": "string",
                "enum": supported_countries,
                "description": "Full country name, e.g. 'Canada'.",
            },
        },
        "required": ["business_type"],
        "additionalProperties": False,
    }
    return resolve_business_type_schema, find_top_locations_schema


class AgentService:
    def __init__(
        self,
        prediction_service: PredictionService,
        census_service: CensusService,
        geography_service: GeographyService,
        anthropic_client: anthropic.AsyncAnthropic,
        supported_countries: list[str],
        supported_states: list[str],
        supported_cities: list[str],
    ):
        self.prediction_service = prediction_service
        self.census_service = census_service
        self.geography_service = geography_service
        self.client = anthropic_client
        self._pending_location_results: list[AgentLocationResult] = []  # UI cards side channel, reset per chat()

        resolve_schema, find_schema = _build_tool_schemas(
            supported_cities, supported_states, supported_countries
        )
        self.tools = [
            beta_async_tool(
                self._resolve_business_type,
                name=TOOL_RESOLVE_BUSINESS_TYPE,
                description=(
                    "Map a free-text business idea (e.g. 'coffee shop', 'gym') to one of the "
                    "supported business type categories."
                ),
                input_schema=resolve_schema,
                strict=True,
            ),
            beta_async_tool(
                self._find_top_locations,
                name=TOOL_FIND_TOP_LOCATIONS,
                description=(
                    "Get the top-scoring census tracts for a business type, ranked by "
                    "opportunity score. Optionally scope to one or more cities, one or more "
                    "neighbourhoods, a state, or a country. Put every city/neighbourhood the "
                    "user names into the respective array in a single call — do not make "
                    "separate calls per city."
                ),
                input_schema=find_schema,
                strict=True,
            ),
        ]

    async def chat(self, messages: list[AgentMessage]) -> AgentChatResponse:
        anthropic_messages: list[dict] = [{"role": m.role, "content": m.content} for m in messages]
        self._pending_location_results = []

        runner = self.client.beta.messages.tool_runner(
            model=MODEL,
            max_tokens=1024,
            system=[  # pyright: ignore[reportArgumentType]
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            tools=self.tools,
            messages=anthropic_messages,  # pyright: ignore[reportArgumentType]
            max_iterations=MAX_TOOL_ITERATIONS,
        )

        # Each iteration is one full round: the runner calls the API, yields
        # Claude's response, then (if it asked for a tool) runs that tool and
        # loops back on its own for another round. Iterating manually here
        # (instead of runner.until_done()) is what lets us log usage per
        # round; final_message gets overwritten every round, so once the
        # loop ends it's just whichever message Claude sent last.
        final_message: Optional[BetaMessage] = None
        async for message in runner:
            self._log_usage(message)
            final_message = message
        assert final_message is not None  # runner always yields >=1 message

        # Still "tool_use" here means max_iterations cut the loop off mid
        # tool-call, not that Claude chose to stop.
        if final_message.stop_reason == "tool_use":
            logger.warning("agent chat exceeded max tool iterations")
            return AgentChatResponse(
                reply="Sorry, I'm having trouble completing that request. Could you try rephrasing it?",
                results=self._pending_location_results,
            )

        return AgentChatResponse(
            reply=self._extract_text(final_message), results=self._pending_location_results
        )

    async def _resolve_business_type(self, business_type: str) -> str:
        bt = BusinessType(business_type)
        return json.dumps({"business_type": bt.value, "label": BUSINESS_CONFIGS[bt].label})

    async def _find_top_locations(
        self,
        business_type: str,
        limit: int = 5,
        order: Literal["asc", "desc"] = "desc",
        city: Optional[list[str]] = None,
        neighbourhood: Optional[list[str]] = None,
        state: Optional[str] = None,
        country: Optional[str] = None,
    ) -> str:
        bt = BusinessType(business_type)
        cities = city or None

        neighbourhood_ids: Optional[list[int]] = None
        if neighbourhood:
            resolution = self.geography_service.resolve_neighbourhoods(
                neighbourhood, cities=cities
            )
            if resolution.status != "found":
                # ambiguous/not_found — a legitimate structured outcome for
                # Claude to react to, not an exception.
                return json.dumps(self._neighbourhood_failure_payload(resolution))
            neighbourhood_ids = resolution.neighbourhood_ids

        predictions = self.prediction_service.get_top_tracts(
            bt,
            limit,
            order,
            neighbourhood_ids=neighbourhood_ids,
            cities=cities,
            state=state,
            country=country,
        )
        centroids = self.census_service.get_tract_centroids(
            [p.tract_id for p in predictions]
        )
        cards = [
            AgentLocationResult(
                tract_id=p.tract_id,
                label=BUSINESS_CONFIGS[bt].label,
                business_type=bt,
                score=p.prediction_score,
                lng=centroids[p.tract_id][0],
                lat=centroids[p.tract_id][1],
            )
            for p in predictions
            if p.tract_id in centroids
        ]
        self._pending_location_results.extend(cards)
        return json.dumps({"tracts": [{"tract_id": c.tract_id, "score": c.score} for c in cards]})

    @staticmethod
    def _neighbourhood_failure_payload(resolution: GeographyResolution) -> dict:
        if resolution.status == "ambiguous":
            return {
                "status": resolution.status,
                "query": resolution.query,
                "candidates": resolution.candidates,
            }
        return {"status": resolution.status, "query": resolution.query}

    @staticmethod
    def _extract_text(response: BetaMessage) -> str:
        return "".join(
            block.text for block in response.content if block.type == "text"
        )

    @staticmethod
    def _log_usage(response: BetaMessage) -> None:
        logger.info(
            "agent chat usage: model=%s input_tokens=%d output_tokens=%d "
            "cache_creation_input_tokens=%d cache_read_input_tokens=%d",
            response.model,
            response.usage.input_tokens,
            response.usage.output_tokens,
            response.usage.cache_creation_input_tokens or 0,
            response.usage.cache_read_input_tokens or 0,
        )
