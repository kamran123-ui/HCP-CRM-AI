"""
LangGraph orchestration.

A minimal two-node ReAct-style graph:

    START -> agent -> (conditional) -> tools -> agent -> ... -> END

`agent` calls the Groq LLM with tools bound; if the model requests a tool
call, we route to `tools`, execute it, append the ToolMessage, and loop
back to `agent`. Once the model responds without requesting a tool, we
end. This is built by hand (rather than `create_react_agent`) so the
control flow is explicit and easy to extend (e.g. adding a guardrail or
human-approval node later).
"""
import uuid
from typing import Annotated, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from sqlalchemy.orm import Session

from app.agents.llm import get_chat_model
from app.agents.prompts import AGENT_SYSTEM_PROMPT
from app.agents.tools import build_tools


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def _should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"
    return END


def build_agent_graph(db: Session, user_id: uuid.UUID):
    """Compile a fresh graph per request, scoped to this DB session/user."""
    tools = build_tools(db, user_id)
    llm = get_chat_model().bind_tools(tools)

    def agent_node(state: AgentState) -> dict:
        messages = state["messages"]
        if not any(isinstance(m, SystemMessage) for m in messages):
            messages = [SystemMessage(content=AGENT_SYSTEM_PROMPT), *messages]
        response = llm.invoke(messages)
        return {"messages": [response]}

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(tools))

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", _should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")

    return graph.compile()
