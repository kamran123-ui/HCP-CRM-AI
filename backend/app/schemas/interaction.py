import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.interaction import InteractionType, Sentiment


class InteractionBase(BaseModel):
    hcp_id: uuid.UUID
    interaction_type: InteractionType = InteractionType.MEETING
    interaction_datetime: Optional[datetime] = None
    attendees: list[str] = Field(default_factory=list)
    topics_discussed: Optional[str] = None
    materials_shared: list[str] = Field(default_factory=list)
    samples_distributed: list[str] = Field(default_factory=list)
    sentiment: Sentiment = Sentiment.NEUTRAL
    outcomes: Optional[str] = None
    follow_up_actions: list[str] = Field(default_factory=list)


class InteractionCreate(InteractionBase):
    """Used by the structured form submission."""


class InteractionCreateFromText(BaseModel):
    """Used by the conversational / voice-note path -- the LLM fills the rest."""

    hcp_id: uuid.UUID
    raw_text: str = Field(min_length=3)


class InteractionUpdate(BaseModel):
    interaction_type: Optional[InteractionType] = None
    interaction_datetime: Optional[datetime] = None
    attendees: Optional[list[str]] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[list[str]] = None
    samples_distributed: Optional[list[str]] = None
    sentiment: Optional[Sentiment] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[list[str]] = None


class InteractionRead(InteractionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    source_text: Optional[str] = None
    ai_extraction: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
