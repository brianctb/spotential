from typing import Literal, Optional
from pydantic import BaseModel, Field
from config.business_type import BusinessType


class AgentMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=500)


class AgentChatRequest(BaseModel):
    messages: list[AgentMessage] = Field(max_length=20)


class AgentLocationResult(BaseModel):
    tract_id: str
    label: str
    business_type: BusinessType
    score: float
    lat: float
    lng: float
    predicted_count: float
    actual_count: int
    neighbourhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class AgentChatResponse(BaseModel):
    reply: str
    results: list[AgentLocationResult]
