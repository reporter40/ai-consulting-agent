"""Artifact API schemas."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ArtifactTypeEnum(str, Enum):
    questionnaire = "questionnaire"
    hypothesis = "hypothesis"
    report = "report"
    stakeholder_map = "stakeholder_map"


class ArtifactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    stage_id: UUID | None
    type: ArtifactTypeEnum
    content: dict
    version: int
    created_at: datetime
