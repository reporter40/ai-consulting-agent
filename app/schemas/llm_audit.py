"""LLM audit log API schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LLMAuditRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID | None
    model: str
    temperature: float
    request_summary: str
    response_summary: str
    created_at: datetime
