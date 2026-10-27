import uuid

from fastapi import APIRouter, Depends
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from sqlalchemy.orm import Session

from app.agents.graph import build_agent_graph
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, ToolInvocation

router = APIRouter(prefix="/chat", tags=["AI Chat"])


def _history_to_messages(history: list[dict[str, str]]):
    messages = []
    for turn in history:
        role, content = turn.get("role"), turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    return messages


@router.post("/message", response_model=ChatMessageResponse)
def send_message(
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatMessageResponse:
    graph = build_agent_graph(db, current_user.id)

    messages = _history_to_messages(payload.history)
    messages.append(HumanMessage(content=payload.message))

    result = graph.invoke({"messages": messages})
    result_messages = result["messages"]

    final_reply = ""
    tool_calls: list[ToolInvocation] = []

    # Walk the transcript to pair each ToolMessage with the AI message that requested it.
    pending_tool_requests: dict[str, dict] = {}
    for msg in result_messages:
        if isinstance(msg, AIMessage) and msg.tool_calls:
            for call in msg.tool_calls:
                pending_tool_requests[call["id"]] = {"tool": call["name"], "input": call["args"]}
        elif isinstance(msg, ToolMessage):
            request = pending_tool_requests.get(msg.tool_call_id, {"tool": msg.name, "input": {}})
            tool_calls.append(
                ToolInvocation(tool=request["tool"], input=request["input"], output=msg.content)
            )
        elif isinstance(msg, AIMessage) and msg.content:
            final_reply = msg.content

    conversation_id = payload.conversation_id or str(uuid.uuid4())
    return ChatMessageResponse(reply=final_reply, conversation_id=conversation_id, tool_calls=tool_calls)
