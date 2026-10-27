"""
LangGraph tool definitions.

Each tool is built by a factory that closes over the current DB session
and authenticated user, so the LLM never sees or controls raw DB
credentials -- it only ever calls named, typed, permission-scoped
functions. This is the same pattern you'd use for any tool-calling agent
that must not be trusted with direct data access.

Required tools per the assignment (minimum 5, two mandatory):
  1. log_interaction      (mandatory)
  2. edit_interaction     (mandatory)
  3. summarize_note
  4. suggest_followup
  5. search_hcp_history
  6. analyze_sentiment
"""
import json
import uuid
from typing import Optional

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agents.llm import get_chat_model
from app.agents.prompts import (
    EXTRACTION_PROMPT,
    FOLLOWUP_PROMPT,
    SENTIMENT_PROMPT,
    SUMMARY_PROMPT,
)
from app.core.logging_config import get_logger
from app.models.hcp import HCP
from app.models.interaction import Interaction, Sentiment

logger = get_logger(__name__)


def _safe_json_loads(text: str, default):
    """LLMs occasionally wrap JSON in fences or add stray text; salvage what we can."""
    cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        logger.warning("Failed to parse LLM JSON output, using default. Raw: %s", text[:200])
        return default


def _resolve_hcp(db: Session, hcp_id: Optional[str], hcp_name: Optional[str]) -> Optional[HCP]:
    if hcp_id:
        try:
            return db.get(HCP, uuid.UUID(hcp_id))
        except ValueError:
            pass
    if hcp_name:
        return db.query(HCP).filter(HCP.name.ilike(f"%{hcp_name}%")).first()
    return None


# ---------------------------------------------------------------------------
# Tool 1 (mandatory): log_interaction
# ---------------------------------------------------------------------------
class LogInteractionArgs(BaseModel):
    hcp_name: str = Field(description="Name of the HCP the rep met/called/emailed.")
    raw_text: str = Field(description="The rep's free-text description of what happened.")


def _make_log_interaction(db: Session, user_id: uuid.UUID) -> StructuredTool:
    def _run(hcp_name: str, raw_text: str) -> str:
        hcp = _resolve_hcp(db, None, hcp_name)
        if hcp is None:
            return f"I couldn't find an HCP named '{hcp_name}' in the system. Please check the spelling or add them first."

        llm = get_chat_model()
        extraction_raw = llm.invoke(EXTRACTION_PROMPT.format(raw_text=raw_text)).content
        extracted = _safe_json_loads(
            extraction_raw,
            default={
                "topics_discussed": raw_text,
                "materials_shared": [],
                "samples_distributed": [],
                "sentiment": "Neutral",
                "outcomes": "",
                "attendees": [],
            },
        )

        interaction = Interaction(
            hcp_id=hcp.id,
            user_id=user_id,
            attendees=extracted.get("attendees", []) or [],
            topics_discussed=extracted.get("topics_discussed", raw_text),
            materials_shared=extracted.get("materials_shared", []) or [],
            samples_distributed=extracted.get("samples_distributed", []) or [],
            sentiment=Sentiment(extracted.get("sentiment", "Neutral")),
            outcomes=extracted.get("outcomes", ""),
            source_text=raw_text,
            ai_extraction=extracted,
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)

        return (
            f"Logged interaction {interaction.id} with {hcp.name}. "
            f"Sentiment: {interaction.sentiment.value}. "
            f"Outcomes: {interaction.outcomes or 'none noted'}."
        )

    return StructuredTool.from_function(
        func=_run,
        name="log_interaction",
        description=(
            "Log a new HCP interaction from a free-text description. Uses the LLM to extract "
            "topics discussed, materials/samples shared, sentiment, and outcomes, then persists "
            "the record. Use this whenever the rep describes something that just happened."
        ),
        args_schema=LogInteractionArgs,
    )


# ---------------------------------------------------------------------------
# Tool 2 (mandatory): edit_interaction
# ---------------------------------------------------------------------------
class EditInteractionArgs(BaseModel):
    interaction_id: str = Field(description="UUID of the interaction to edit.")
    field: str = Field(
        description=(
            "Which field to update: one of topics_discussed, outcomes, sentiment, "
            "materials_shared, samples_distributed, follow_up_actions, attendees."
        )
    )
    new_value: str = Field(description="The new value. For list fields, comma-separate items.")


def _make_edit_interaction(db: Session, user_id: uuid.UUID) -> StructuredTool:
    list_fields = {"materials_shared", "samples_distributed", "follow_up_actions", "attendees"}

    def _run(interaction_id: str, field: str, new_value: str) -> str:
        try:
            interaction = db.get(Interaction, uuid.UUID(interaction_id))
        except ValueError:
            return "That interaction id doesn't look valid. Please double check it."

        if interaction is None or interaction.user_id != user_id:
            return "I couldn't find that interaction, or you don't have access to edit it."

        if not hasattr(interaction, field):
            return f"'{field}' isn't a field I can edit on an interaction."

        value = [v.strip() for v in new_value.split(",")] if field in list_fields else new_value
        if field == "sentiment":
            value = Sentiment(new_value)

        setattr(interaction, field, value)
        db.commit()
        return f"Updated {field} on interaction {interaction_id}."

    return StructuredTool.from_function(
        func=_run,
        name="edit_interaction",
        description="Modify a single field on a previously logged interaction, identified by its id.",
        args_schema=EditInteractionArgs,
    )


# ---------------------------------------------------------------------------
# Tool 3: summarize_note (voice-note / long free text -> structured bullets)
# ---------------------------------------------------------------------------
class SummarizeNoteArgs(BaseModel):
    raw_text: str = Field(description="Long free-text or voice-note transcript to summarize.")


def _make_summarize_note() -> StructuredTool:
    def _run(raw_text: str) -> str:
        llm = get_chat_model()
        return llm.invoke(SUMMARY_PROMPT.format(raw_text=raw_text)).content

    return StructuredTool.from_function(
        func=_run,
        name="summarize_note",
        description=(
            "Summarize a long voice-note transcript or rambling note into crisp bullet points "
            "before logging it. Use this before log_interaction when the input is long/unstructured."
        ),
        args_schema=SummarizeNoteArgs,
    )


# ---------------------------------------------------------------------------
# Tool 4: suggest_followup
# ---------------------------------------------------------------------------
class SuggestFollowupArgs(BaseModel):
    topics_discussed: str = Field(description="What was discussed in the interaction.")
    outcomes: str = Field(default="", description="Outcomes or agreements reached.")
    sentiment: str = Field(default="Neutral", description="Positive, Neutral, or Negative.")


def _make_suggest_followup() -> StructuredTool:
    def _run(topics_discussed: str, outcomes: str = "", sentiment: str = "Neutral") -> str:
        llm = get_chat_model()
        raw = llm.invoke(
            FOLLOWUP_PROMPT.format(
                topics_discussed=topics_discussed, outcomes=outcomes, sentiment=sentiment
            )
        ).content
        suggestions = _safe_json_loads(raw, default=[])
        if not isinstance(suggestions, list) or not suggestions:
            return "No specific follow-ups came to mind -- consider a check-in call next week."
        return "Suggested follow-ups: " + "; ".join(suggestions)

    return StructuredTool.from_function(
        func=_run,
        name="suggest_followup",
        description="Suggest concrete next-step actions after an interaction is logged.",
        args_schema=SuggestFollowupArgs,
    )


# ---------------------------------------------------------------------------
# Tool 5: search_hcp_history
# ---------------------------------------------------------------------------
class SearchHistoryArgs(BaseModel):
    hcp_name: str = Field(description="Name (or partial name) of the HCP to look up.")
    limit: int = Field(default=5, description="Max number of past interactions to return.")


def _make_search_hcp_history(db: Session) -> StructuredTool:
    def _run(hcp_name: str, limit: int = 5) -> str:
        hcp = _resolve_hcp(db, None, hcp_name)
        if hcp is None:
            return f"No HCP found matching '{hcp_name}'."

        history = (
            db.query(Interaction)
            .filter(Interaction.hcp_id == hcp.id)
            .order_by(Interaction.interaction_datetime.desc())
            .limit(limit)
            .all()
        )
        if not history:
            return f"{hcp.name} has no logged interactions yet."

        lines = [
            f"- {i.interaction_datetime:%Y-%m-%d}: {i.interaction_type.value}, "
            f"sentiment {i.sentiment.value}, outcomes: {i.outcomes or 'n/a'}"
            for i in history
        ]
        return f"Recent history for {hcp.name}:\n" + "\n".join(lines)

    return StructuredTool.from_function(
        func=_run,
        name="search_hcp_history",
        description="Retrieve recent logged interactions for a given HCP by name.",
        args_schema=SearchHistoryArgs,
    )


# ---------------------------------------------------------------------------
# Tool 6: analyze_sentiment
# ---------------------------------------------------------------------------
class AnalyzeSentimentArgs(BaseModel):
    raw_text: str = Field(description="Text describing the interaction to classify.")


def _make_analyze_sentiment() -> StructuredTool:
    def _run(raw_text: str) -> str:
        llm = get_chat_model()
        result = llm.invoke(SENTIMENT_PROMPT.format(raw_text=raw_text)).content.strip()
        return f"Sentiment: {result}"

    return StructuredTool.from_function(
        func=_run,
        name="analyze_sentiment",
        description="Classify the HCP's sentiment (Positive/Neutral/Negative) from a note.",
        args_schema=AnalyzeSentimentArgs,
    )


def build_tools(db: Session, user_id: uuid.UUID) -> list[StructuredTool]:
    """Assemble the full toolbelt for a single request-scoped agent run."""
    return [
        _make_log_interaction(db, user_id),
        _make_edit_interaction(db, user_id),
        _make_summarize_note(),
        _make_suggest_followup(),
        _make_search_hcp_history(db),
        _make_analyze_sentiment(),
    ]
