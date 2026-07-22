from unittest.mock import AsyncMock

import anthropic
import httpx
import pytest
from fastapi.testclient import TestClient

from dependencies import get_agent_service
from limiter import limiter
from main import app
from schema.agent import AgentChatResponse

# TestClient(app) used *without* entering it as a context manager never runs
# main.py's `lifespan` (no DB/ML-model/ANTHROPIC_API_KEY needed) as long as
# every dependency the route itself declares is overridden below.
client = TestClient(app)

# SlowAPIMiddleware reads app.state.limiter unconditionally, which is normally
# only set inside main.py's `lifespan` — set it directly here instead of
# running the full lifespan (which would need a DB, the ML model file, and
# ANTHROPIC_API_KEY). Also disable the limiter
app.state.limiter = limiter
limiter.enabled = False


def make_rate_limit_error() -> anthropic.RateLimitError:
    request = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
    body = {"error": {"type": "rate_limit_error", "message": "rate limited"}}
    response = httpx.Response(429, request=request, json=body)
    return anthropic.RateLimitError("rate limited", response=response, body=body)


def make_connection_error() -> anthropic.APIConnectionError:
    request = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
    return anthropic.APIConnectionError(request=request)


# autouse=True runs this for every test in this file automatically, with no
# test needing to request it by name. app is one shared object across the
# whole test session, so without this, an override left behind by one test
# could leak into a later
@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides.clear()


def override_agent_service(chat_side_effect):
    # dependency_overrides must map to a callable that returns the fake
    # service -- fake_service itself is callable, so registering it directly
    # would invoke it and store its return value instead.
    fake_service = AsyncMock()
    fake_service.chat.side_effect = chat_side_effect
    app.dependency_overrides[get_agent_service] = lambda: fake_service


class TestChatEndpoint:
    def test_valid_request_returns_agent_response(self):
        canned = AgentChatResponse(reply="hello", results=[])
        override_agent_service(lambda messages: canned)

        response = client.post("/agent/chat", json={"messages": [{"role": "user", "content": "hi"}]})

        assert response.status_code == 200
        assert response.json() == {"reply": "hello", "results": []}

    def test_rate_limit_error_maps_to_429(self):
        def raise_rate_limit(messages):
            raise make_rate_limit_error()

        override_agent_service(raise_rate_limit)

        response = client.post("/agent/chat", json={"messages": [{"role": "user", "content": "hi"}]})

        assert response.status_code == 429

    def test_connection_error_maps_to_502(self):
        def raise_connection_error(messages):
            raise make_connection_error()

        override_agent_service(raise_connection_error)

        response = client.post("/agent/chat", json={"messages": [{"role": "user", "content": "hi"}]})

        assert response.status_code == 502

    def test_unexpected_exception_maps_to_500_without_leaking_detail(self):
        def raise_value_error(messages):
            raise ValueError("some internal secret detail")

        override_agent_service(raise_value_error)

        response = client.post("/agent/chat", json={"messages": [{"role": "user", "content": "hi"}]})

        assert response.status_code == 500
        assert "some internal secret detail" not in response.text

    def test_too_many_messages_rejected_before_reaching_service(self):
        override_agent_service(lambda messages: AgentChatResponse(reply="unreachable", results=[]))

        response = client.post(
            "/agent/chat",
            json={"messages": [{"role": "user", "content": "hi"} for _ in range(21)]},
        )

        assert response.status_code == 422

    def test_overlong_message_content_rejected(self):
        override_agent_service(lambda messages: AgentChatResponse(reply="unreachable", results=[]))

        response = client.post(
            "/agent/chat",
            json={"messages": [{"role": "user", "content": "x" * 501}]},
        )

        assert response.status_code == 422
