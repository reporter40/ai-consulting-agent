"""Workflow / LangGraph API schemas."""

from uuid import UUID

from pydantic import BaseModel, Field


class WorkflowStateResponse(BaseModel):
    project_id: UUID
    current_stage: str
    allowed_next: list[str]
    awaiting_human: bool
    human_checkpoint: str | None = None
    hitl: dict[str, bool] = Field(default_factory=dict)


class WorkflowAdvanceRequest(BaseModel):
    """Advance only to the next stage in order (validated server-side)."""

    target_stage: str = Field(..., max_length=100)


class HumanConfirmRequest(BaseModel):
    checkpoint: str = Field(..., max_length=100)
    approved: bool = True
