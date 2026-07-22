from types import SimpleNamespace
from typing import AsyncIterator


def stub_beta_message(
    stop_reason: str,
    text: str = "",
    model: str = "claude-haiku-4-5-20251001",
) -> SimpleNamespace:
    """Minimal stand-in for anthropic.types.beta.BetaMessage, exposing only
    the attributes AgentService actually reads."""
    return SimpleNamespace(
        stop_reason=stop_reason,
        content=[SimpleNamespace(type="text", text=text)] if text else [],
        model=model,
        usage=SimpleNamespace(
            input_tokens=100,
            output_tokens=50,
            cache_creation_input_tokens=0,
            cache_read_input_tokens=0,
        ),
    )


async def _async_gen(messages: tuple) -> AsyncIterator:
    for message in messages:
        yield message


def stub_tool_runner(*messages: SimpleNamespace) -> AsyncIterator:
    """Async iterator standing in for client.beta.messages.tool_runner(...)."""
    return _async_gen(messages)
