import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InteractionType(str, enum.Enum):
    MEETING = "Meeting"
    CALL = "Call"
    EMAIL = "Email"
    CONFERENCE = "Conference"
    SAMPLE_DROP = "Sample Drop"


class Sentiment(str, enum.Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"


class Interaction(Base):
    """A single logged interaction between a field rep and an HCP."""

    __tablename__ = "interactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    hcp_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    interaction_type: Mapped[InteractionType] = mapped_column(
        Enum(InteractionType), default=InteractionType.MEETING
    )
    interaction_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    attendees: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    topics_discussed: Mapped[str] = mapped_column(Text, nullable=True)

    materials_shared: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    samples_distributed: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    sentiment: Mapped[Sentiment] = mapped_column(Enum(Sentiment), default=Sentiment.NEUTRAL)
    outcomes: Mapped[str] = mapped_column(Text, nullable=True)
    follow_up_actions: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    # Raw free-text the user typed/spoke, plus what the LLM extracted from it.
    source_text: Mapped[str] = mapped_column(Text, nullable=True)
    ai_extraction: Mapped[dict] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    hcp = relationship("HCP", back_populates="interactions")
    logged_by = relationship("User", back_populates="interactions")
