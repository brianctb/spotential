import logging

from anthropic import APIConnectionError, APIStatusError, RateLimitError
from fastapi import APIRouter, Depends, HTTPException, Request
from schema.agent import AgentChatRequest, AgentChatResponse
from service.AgentService import AgentService
from dependencies import get_agent_service
from limiter import limiter

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat", response_model=AgentChatResponse)
@limiter.limit("3/minute;10/day")
async def chat(
        request: Request,
        body: AgentChatRequest,
        service: AgentService = Depends(get_agent_service),
):
    try:
        return await service.chat(body.messages)
    except RateLimitError as e:
        logger.warning("agent chat hit Anthropic rate limit: %s", e.message)
        raise HTTPException(
            status_code=429,
            detail="AI assistant is receiving too many requests right now, please try again shortly",
        )
    except APIConnectionError as e:
        logger.error("agent chat could not reach Anthropic API: %s", e.message)
        raise HTTPException(status_code=502, detail="AI assistant is temporarily unavailable")
    except APIStatusError as e:
        logger.error(
            "agent chat Anthropic API error: status=%s type=%s request_id=%s message=%s",
            e.status_code, e.type, e.request_id, e.message,
        )
        raise HTTPException(status_code=502, detail="AI assistant is temporarily unavailable")
    except Exception:
        logger.exception("agent chat failed unexpectedly")
        raise HTTPException(status_code=500, detail="Something went wrong processing your request")
