import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class HCPCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    specialty: Optional[str] = None
    institution: Optional[str] = None
    tier: Optional[str] = Field(default=None, max_length=10)


class HCPRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    specialty: Optional[str]
    institution: Optional[str]
    tier: Optional[str]
    created_at: datetime
