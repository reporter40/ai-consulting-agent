"""LangGraph workflow state."""

from __future__ import annotations

from typing import Annotated, NotRequired, TypedDict


class WorkflowState(TypedDict):
    """Typed state for LangGraph."""

    project_id: str
    current_stage: str
    awaiting_human: bool
    human_checkpoint: NotRequired[str | None]
    last_event: NotRequired[str]


def merge_stage(
    left: WorkflowState, right: WorkflowState
) -> WorkflowState:
    """Reducer: keep latest non-empty stage fields."""
    out = {**left, **right}
    return out  # type: ignore[return-value]


StageAnnotation = Annotated[WorkflowState, merge_stage]
