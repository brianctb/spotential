from fastapi import APIRouter, Depends, HTTPException, Request
from schema.agent import AgentChatRequest, AgentChatResponse
from service.AgentService import AgentService
from dependencies import get_agent_service
from limiter import limiter

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
    except Exception:
        raise HTTPException(status_code=502, detail="AI assistant is temporarily unavailable")
