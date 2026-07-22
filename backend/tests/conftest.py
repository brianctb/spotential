from unittest.mock import MagicMock, Mock

import pytest

from service.AgentService import AgentService
from service.CensusService import CensusService
from service.GeographyService import GeographyService
from service.PredictionService import PredictionService


@pytest.fixture
def mock_prediction_service() -> Mock:
    return Mock(spec=PredictionService)


@pytest.fixture
def mock_census_service() -> Mock:
    return Mock(spec=CensusService)


@pytest.fixture
def mock_geography_service() -> Mock:
    return Mock(spec=GeographyService)


@pytest.fixture
def mock_anthropic_client() -> MagicMock:
    return MagicMock()


@pytest.fixture
def agent_service(
    mock_prediction_service: Mock,
    mock_census_service: Mock,
    mock_geography_service: Mock,
    mock_anthropic_client: MagicMock,
) -> AgentService:
    return AgentService(
        prediction_service=mock_prediction_service,
        census_service=mock_census_service,
        geography_service=mock_geography_service,
        anthropic_client=mock_anthropic_client,
        supported_countries=["Canada"],
        supported_states=["British Columbia"],
        supported_cities=["Vancouver", "Burnaby"],
    )
