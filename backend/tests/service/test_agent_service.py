import json
from unittest.mock import MagicMock, Mock

import pytest

from config.business_type import BusinessType, BusinessCategory
from models.model_outputs import ModelPrediction
from schema.agent import AgentLocationResult
from schema.geography import GeographyResolution
from service.AgentService import AgentService
from tests.anthropic_stubs import stub_beta_message, stub_tool_runner


def make_prediction(tract_id: str, score: float) -> ModelPrediction:
    return ModelPrediction(
        tract_id=tract_id,
        business_type=BusinessType.FITNESS_CENTRE,
        business_category=BusinessCategory.FITNESS,
        total_business_count=5,
        actual_count=1,
        predicted_count=3.2,
        prediction_score=score,
    )


# --- _resolve_business_type -------------------------------------------------


class TestResolveBusinessType:
    @pytest.mark.asyncio
    async def test_maps_free_text_to_enum_and_label(self, agent_service: AgentService):
        result = json.loads(await agent_service._resolve_business_type("fitness_centre"))
        assert result == {"business_type": "fitness_centre", "label": "Gym"}

    @pytest.mark.asyncio
    async def test_invalid_value_raises(self, agent_service: AgentService):
        with pytest.raises(ValueError):
            await agent_service._resolve_business_type("not_a_real_business_type")


# --- _find_top_locations -----------------------------------------------------


class TestFindTopLocations:
    @pytest.mark.asyncio
    async def test_returns_score_only_json_and_populates_full_cards(
        self, agent_service: AgentService, mock_prediction_service: Mock, mock_census_service: Mock
    ):
        mock_prediction_service.get_top_tracts.return_value = [
            make_prediction("9330038.00", 79.9),
            make_prediction("9330045.02", 68.2),
        ]
        mock_census_service.get_tract_centroids.return_value = {
            "9330038.00": (-123.1, 49.25),
            "9330045.02": (-123.2, 49.26),
        }

        raw = await agent_service._find_top_locations(business_type="fitness_centre", limit=2)
        payload = json.loads(raw)

        # Claude only ever sees tract_id + score, keeping its context small.
        assert payload == {
            "tracts": [
                {"tract_id": "9330038.00", "score": 79.9},
                {"tract_id": "9330045.02", "score": 68.2},
            ]
        }
        # The UI-card side channel gets the full data instead.
        assert agent_service._pending_location_results == [
            AgentLocationResult(
                tract_id="9330038.00", label="Gym", business_type=BusinessType.FITNESS_CENTRE,
                score=79.9, lng=-123.1, lat=49.25,
            ),
            AgentLocationResult(
                tract_id="9330045.02", label="Gym", business_type=BusinessType.FITNESS_CENTRE,
                score=68.2, lng=-123.2, lat=49.26,
            ),
        ]

    @pytest.mark.asyncio
    async def test_drops_tract_missing_from_centroids(
        self, agent_service: AgentService, mock_prediction_service: Mock, mock_census_service: Mock
    ):
        mock_prediction_service.get_top_tracts.return_value = [
            make_prediction("9330038.00", 79.9),
            make_prediction("9330045.02", 68.2),
        ]
        # Only one of the two tracts has a centroid on record.
        mock_census_service.get_tract_centroids.return_value = {"9330038.00": (-123.1, 49.25)}

        raw = await agent_service._find_top_locations(business_type="fitness_centre", limit=2)
        payload = json.loads(raw)

        assert payload == {"tracts": [{"tract_id": "9330038.00", "score": 79.9}]}
        assert len(agent_service._pending_location_results) == 1

    @pytest.mark.asyncio
    async def test_ambiguous_neighbourhood_short_circuits(
        self, agent_service: AgentService, mock_geography_service: Mock, mock_prediction_service: Mock
    ):
        mock_geography_service.resolve_neighbourhoods.return_value = GeographyResolution(
            status="ambiguous",
            query="Downtown",
            candidates=["Downtown (Vancouver)", "Downtown (Surrey)"],
        )

        raw = await agent_service._find_top_locations(
            business_type="fitness_centre", limit=5, neighbourhood=["Downtown"]
        )
        payload = json.loads(raw)

        assert payload == {
            "status": "ambiguous",
            "query": "Downtown",
            "candidates": ["Downtown (Vancouver)", "Downtown (Surrey)"],
        }
        mock_prediction_service.get_top_tracts.assert_not_called()

    @pytest.mark.asyncio
    async def test_not_found_neighbourhood_short_circuits(
        self, agent_service: AgentService, mock_geography_service: Mock, mock_prediction_service: Mock
    ):
        mock_geography_service.resolve_neighbourhoods.return_value = GeographyResolution(
            status="not_found", query="Nowhereville"
        )

        raw = await agent_service._find_top_locations(
            business_type="fitness_centre", limit=5, neighbourhood=["Nowhereville"]
        )
        payload = json.loads(raw)

        assert payload == {"status": "not_found", "query": "Nowhereville"}
        mock_prediction_service.get_top_tracts.assert_not_called()

    @pytest.mark.asyncio
    async def test_passes_geography_filters_through_to_prediction_service(
        self, agent_service: AgentService, mock_prediction_service: Mock, mock_census_service: Mock
    ):
        mock_prediction_service.get_top_tracts.return_value = []
        mock_census_service.get_tract_centroids.return_value = {}

        await agent_service._find_top_locations(
            business_type="fitness_centre",
            limit=3,
            order="asc",
            city=["Vancouver", "Burnaby"],
            state="British Columbia",
            country="Canada",
        )

        mock_prediction_service.get_top_tracts.assert_called_once_with(
            BusinessType.FITNESS_CENTRE,
            3,
            "asc",
            neighbourhood_ids=None,
            cities=["Vancouver", "Burnaby"],
            state="British Columbia",
            country="Canada",
        )


# --- chat() orchestration ----------------------------------------------------


class TestChat:
    @pytest.mark.asyncio
    async def test_extracts_final_reply_text(
        self, agent_service: AgentService, mock_anthropic_client: MagicMock
    ):
        mock_anthropic_client.beta.messages.tool_runner.return_value = stub_tool_runner(
            stub_beta_message(stop_reason="end_turn", text="Here are some gyms.")
        )

        response = await agent_service.chat([])

        assert response.reply == "Here are some gyms."
        assert response.results == []

    @pytest.mark.asyncio
    async def test_max_iterations_exceeded_returns_canned_reply(
        self, agent_service: AgentService, mock_anthropic_client: MagicMock
    ):
        mock_anthropic_client.beta.messages.tool_runner.return_value = stub_tool_runner(
            stub_beta_message(stop_reason="tool_use", text="")
        )

        response = await agent_service.chat([])

        assert "having trouble" in response.reply.lower()

    @pytest.mark.asyncio
    async def test_pending_results_reset_between_calls(
        self, agent_service: AgentService, mock_anthropic_client: MagicMock
    ):
        agent_service._pending_location_results = [
            AgentLocationResult(
                tract_id="stale", label="Gym", business_type=BusinessType.FITNESS_CENTRE,
                score=1.0, lng=0.0, lat=0.0,
            )
        ]
        mock_anthropic_client.beta.messages.tool_runner.return_value = stub_tool_runner(
            stub_beta_message(stop_reason="end_turn", text="ok")
        )

        response = await agent_service.chat([])

        assert response.results == []
