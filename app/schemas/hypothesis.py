"""Hypothesis schemas."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HypothesisStatusEnum(str, Enum):
    generated = "generated"
    validated = "validated"
    rejected = "rejected"
    selected = "selected"


class HypothesisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    text: str
    confidence_score: float
    confidence_level: str
    evidence: list | dict
    sources: list | dict
    status: HypothesisStatusEnum
    created_at: datetime


class HypothesisGenerateRequest(BaseModel):
    """Optional context snippet (anonymized) for generation."""

    context_summary: str = Field(default="", max_length=8000)


class HypothesisVerifyRequest(BaseModel):
    hypothesis_id: UUID


class HypothesisSelectRequest(BaseModel):
    hypothesis_id: UUID
