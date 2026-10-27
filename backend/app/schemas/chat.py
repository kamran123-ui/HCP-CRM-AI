import uuid
from typing import Any, Optional

from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(min_length=1)
    hcp_id: Optional[uuid.UUID] = None
    # Client-held conversation id lets the frontend keep a running thread;
    # the agent itself is stateless per-request (state is reconstructed
    # from the transcript sent by the client).
    conversation_id: Optional[str] = None
    history: list[dict[str, str]] = Field(default_factory=list)


class ToolInvocation(BaseModel):
    tool: str
    input: dict[str, Any]
    output: Any


class ChatMessageResponse(BaseModel):
    reply: str
    conversation_id: str
    tool_calls: list[ToolInvocation] = Field(default_factory=list)
