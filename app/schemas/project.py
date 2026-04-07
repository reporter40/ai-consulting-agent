"""Project-related schemas."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectStatusEnum(str, Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    completed = "completed"


class ProjectCreate(BaseModel):
    name: str = Field(..., max_length=255)
    client_name: str = Field(..., max_length=255)
    consultant_id: UUID | None = None


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    client_name: str
    status: ProjectStatusEnum
    current_stage: str
    created_at: datetime
    updated_at: datetime
    consultant_id: UUID | None


class ProjectList(BaseModel):
    items: list[ProjectRead]
    total: int
