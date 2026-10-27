import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HCP(Base):
    """A Healthcare Professional (doctor) tracked by field representatives."""

    __tablename__ = "hcps"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    specialty: Mapped[str] = mapped_column(String(120), nullable=True)
    institution: Mapped[str] = mapped_column(String(255), nullable=True)
    tier: Mapped[str] = mapped_column(String(10), nullable=True)  # A / B / C priority tier
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    interactions = relationship("Interaction", back_populates="hcp", cascade="all, delete-orphan")
