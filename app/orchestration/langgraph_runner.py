"""LangGraph compiled graph — DB `projects.current_stage` is the source of truth.

The linear `compiled_workflow` mirrors the canonical `STAGE_ORDER` for tooling and
future checkpoints; step execution is driven by API + `workflow_service`, not by
running the full graph on each request.
"""

from __future__ import annotations

from app.orchestration.graph import compiled_workflow
from app.orchestration.stages import STAGE_ORDER
from app.orchestration.state import WorkflowState


def build_initial_state(project_id: str, current_stage: str) -> WorkflowState:
    """Construct a WorkflowState snapshot for logging or future LangGraph runs."""
    awaiting = current_stage in ("hypothesis_synthesis", "report_review")
    cp: str | None = None
    if current_stage == "hypothesis_synthesis":
        cp = "method_selection"
    elif current_stage == "report_review":
        cp = "final_report"
    return {
        "project_id": project_id,
        "current_stage": current_stage,
        "awaiting_human": awaiting,
        "human_checkpoint": cp,
    }


def stage_order_valid(stage: str) -> bool:
    return stage in STAGE_ORDER


__all__ = ["compiled_workflow", "build_initial_state", "stage_order_valid"]
