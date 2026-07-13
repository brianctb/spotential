import json
import logging
from typing import Awaitable, Callable, NamedTuple
import anthropic
import httpx
from config.business_type import BusinessType, BUSINESS_CONFIGS
from schema.agent import AgentMessage, AgentLocationResult, AgentChatResponse
from service.PredictionService import PredictionService
from service.CensusService import CensusService

logger = logging.getLogger("uvicorn")


class ToolResult(NamedTuple):
    llm_output: dict
    is_error: bool
    # Only find_top_locations sets this; the shared empty-list default is
    # never mutated in place, so reuse across instances is safe.
    ui_payload: list[AgentLocationResult] = []


ToolHandler = Callable[[dict], Awaitable[ToolResult]]

MAX_TOOL_ITERATIONS = 4

SYSTEM_PROMPT = (
    "You are Spotential's location assistant. You help users find good places in "
    "Vancouver, BC to open a business, using real census and business-density data. "
    "Only discuss Vancouver locations and the business types you have tools for. "
    "Keep replies to 2-3 sentences — the UI shows structured result cards separately, "
    "don't restate them as prose."
)

MODEL = "claude-haiku-4-5-20251001"

TOOL_RESOLVE_BUSINESS_TYPE = "resolve_business_type"
TOOL_GEOCODE_LOCATION = "geocode_location"
TOOL_FIND_TOP_LOCATIONS = "find_top_locations"

TOOLS = [
    {
        "name": TOOL_RESOLVE_BUSINESS_TYPE,
        "description": (
            "Map a free-text business idea (e.g. 'coffee shop', 'gym') to one of the "
            "supported business type categories."
        ),
        "strict": True,
        "input_schema": {
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
        },
    },
    {
        "name": TOOL_GEOCODE_LOCATION,
        "description": (
            "Look up latitude/longitude for a Vancouver place name or neighbourhood "
            "mentioned by the user (e.g. 'Kitsilano', 'near Main St')."
        ),
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The place name to geocode."}
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "name": TOOL_FIND_TOP_LOCATIONS,
        "description": "Get the top-scoring census tracts for a business type, ranked by opportunity score.",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "business_type": {"type": "string", "enum": [bt.value for bt in BusinessType]},
                "limit": {"type": "integer", "description": "How many locations to return (max 5)."},
                "order": {
                    "type": "string",
                    "enum": ["desc", "asc"],
                    "description": "desc = best opportunity first.",
                },
            },
            "required": ["business_type"],
            "additionalProperties": False,
        },
    },
]


class AgentService:
    def __init__(
        self,
        prediction_service: PredictionService,
        census_service: CensusService,
        http_client: httpx.AsyncClient,
        anthropic_client: anthropic.AsyncAnthropic,
    ):
        self.prediction_service = prediction_service
        self.census_service = census_service
        self.http_client = http_client
        self.client = anthropic_client
        self._handlers: dict[str, ToolHandler] = {
            TOOL_RESOLVE_BUSINESS_TYPE: self._resolve_business_type,
            TOOL_GEOCODE_LOCATION: self._handle_geocode,
            TOOL_FIND_TOP_LOCATIONS: self._find_top_locations,
        }

    async def chat(self, messages: list[AgentMessage]) -> AgentChatResponse:
        anthropic_messages: list[dict] = [{"role": m.role, "content": m.content} for m in messages]
        location_results: list[AgentLocationResult] = []

        # The API is stateless per call — anthropic_messages is replayed in full
        # on every iteration (including any tool_use/tool_result pairs already
        # appended below), so each new call gives Claude the entire history to
        # either produce a final answer or chain another tool call.
        for _ in range(MAX_TOOL_ITERATIONS):
            response = await self.client.messages.create(
                model=MODEL,
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                tools=TOOLS,  # pyright: ignore[reportArgumentType]
                messages=anthropic_messages,  # pyright: ignore[reportArgumentType]
            )
            self._log_usage(response)

            # Anything other than "tool_use" means Claude is done — return
            # immediately with whatever text it produced.
            if response.stop_reason != "tool_use":
                return AgentChatResponse(reply=self._extract_text(response), results=location_results)

            # stop_reason == "tool_use": execute every tool Claude asked for
            # (a single turn can request more than one, in parallel) and build
            # one tool_result per block, matched by tool_use_id so Claude can
            # tell which result answers which request.
            tool_results = []
            for block in response.content:
                if block.type != "tool_use":
                    continue
                result = await self._dispatch_tool(block.name, block.input)
                tool_result: dict = {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result.llm_output),
                }
                if result.is_error:
                    tool_result["is_error"] = True
                tool_results.append(tool_result)
                # Cards accumulate across every tool round regardless of which
                # iteration ends up returning.
                location_results.extend(result.ui_payload)

            # Replay Claude's own tool_use blocks (so it can match the results
            # below to what it asked for), then supply the results as the next
            # "user" turn — there's no separate "tool" role in this API. No
            # return here: loop back and ask Claude again with these results
            # now in context.
            anthropic_messages.append({"role": "assistant", "content": response.content})  # pyright: ignore[reportArgumentType]
            anthropic_messages.append({"role": "user", "content": tool_results})

        # Ran out of iterations without Claude ever giving a final text answer
        # (every attempt came back tool_use) — bail out safely instead of
        # looping forever or crashing.
        logger.warning("agent chat exceeded max tool iterations")
        return AgentChatResponse(
            reply="Sorry, I'm having trouble completing that request. Could you try rephrasing it?",
            results=location_results,
        )

    async def _dispatch_tool(self, name: str, tool_input: dict) -> ToolResult:
        handler = self._handlers.get(name)
        if handler is None:
            return ToolResult({"error": f"unknown tool {name}"}, is_error=True)
        return await handler(tool_input)

    async def _resolve_business_type(self, tool_input: dict) -> ToolResult:
        bt = BusinessType(tool_input["business_type"])
        return ToolResult(
            {"business_type": bt.value, "label": BUSINESS_CONFIGS[bt].label}, is_error=False
        )

    async def _handle_geocode(self, tool_input: dict) -> ToolResult:
        result = await self._geocode(tool_input["query"])
        if result is None:
            return ToolResult({"found": False}, is_error=False)
        return ToolResult({"found": True, **result}, is_error=False)

    async def _find_top_locations(self, tool_input: dict) -> ToolResult:
        bt = BusinessType(tool_input["business_type"])
        limit = tool_input.get("limit", 5)
        order = tool_input.get("order", "desc")
        predictions = self.prediction_service.get_top_tracts(bt, limit, order)
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
        return ToolResult(
            {"tracts": [{"tract_id": c.tract_id, "score": c.score} for c in cards]},
            is_error=False,
            ui_payload=cards,
        )

    async def _geocode(self, query: str) -> dict | None:
        try:
            resp = await self.http_client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": 1,
                    "viewbox": "-123.27,49.32,-123.02,49.20",
                    "bounded": 1,
                },
                headers={"User-Agent": "Spotential/1.0"},
                timeout=5.0,
            )
            resp.raise_for_status()
            data = resp.json()
        except (httpx.HTTPError, ValueError):
            return None
        if not data:
            return None
        return {"lat": float(data[0]["lat"]), "lng": float(data[0]["lon"])}

    @staticmethod
    def _extract_text(response) -> str:
        return "".join(
            block.text for block in response.content if block.type == "text"
        )

    @staticmethod
    def _log_usage(response) -> None:
        logger.info(
            "agent chat usage: model=%s input_tokens=%d output_tokens=%d",
            response.model,
            response.usage.input_tokens,
            response.usage.output_tokens,
        )
