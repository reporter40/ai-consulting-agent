"""Project workflow transitions, HITL, LangGraph-aligned stages table, Redis events."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import AppError, ValidationError
from app.models.project import Project
from app.models.stage import Stage, StageStatus
from app.orchestration.stages import STAGE_ORDER, can_transition, next_stage
from app.orchestration.workflow_rules import hitl_error_for_transition
from app.redis_client import publish_workflow_event, push_workflow_event_list


def _as_hitl(project: Project) -> dict[str, bool]:
    raw = project.hitl if isinstance(project.hitl, dict) else {}
    out: dict[str, bool] = {}
    for k, v in raw.items():
        if isinstance(v, bool):
            out[str(k)] = v
    return out


async def get_workflow_view(session: AsyncSession, project_id: uuid.UUID) -> dict:
    result = await session.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise AppError("Project not found", code="not_found")
    allowed: list[str] = []
    nxt = next_stage(project.current_stage)
    if nxt is not None:
        allowed.append(nxt)
    awaiting = project.current_stage in ("hypothesis_synthesis", "report_review")
    checkpoint = None
    if project.current_stage == "hypothesis_synthesis":
        checkpoint = "method_selection"
    elif project.current_stage == "report_review":
        checkpoint = "final_report"
    return {
        "project_id": project.id,
        "current_stage": project.current_stage,
        "allowed_next": allowed,
        "awaiting_human": awaiting,
        "human_checkpoint": checkpoint,
        "hitl": _as_hitl(project),
    }


async def _sync_stage_rows(
    session: AsyncSession,
    project_id: uuid.UUID,
    old_stage: str,
    new_stage: str,
) -> None:
    """Mark previous stage completed; activate new stage row."""
    if old_stage == new_stage:
        return
    now = datetime.now(timezone.utc)
    prev = await session.execute(
        select(Stage).where(
            Stage.project_id == project_id,
            Stage.stage_name == old_stage,
            Stage.status == StageStatus.active,
        )
    )
    prev_row = prev.scalar_one_or_none()
    if prev_row:
        prev_row.status = StageStatus.completed
        prev_row.completed_at = now

    nxt = await session.execute(
        select(Stage).where(
            Stage.project_id == project_id,
            Stage.stage_name == new_stage,
        )
    )
    existing = nxt.scalar_one_or_none()
    if existing:
        existing.status = StageStatus.active
        if existing.started_at is None:
            existing.started_at = now
    else:
        session.add(
            Stage(
                project_id=project_id,
                stage_name=new_stage,
                status=StageStatus.active,
                started_at=now,
            )
        )


async def advance_stage(
    session: AsyncSession, project_id: uuid.UUID, target_stage: str
) -> dict:
    result = await session.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise AppError("Project not found", code="not_found")
    if target_stage not in STAGE_ORDER:
        raise ValidationError(f"Invalid stage: {target_stage}")
    if not can_transition(project.current_stage, target_stage):
        raise ValidationError(
            "Stage transition not allowed — only the next stage in order is permitted."
        )
    hitl = _as_hitl(project)
    block = hitl_error_for_transition(project.current_stage, target_stage, hitl)
    if block:
        raise ValidationError(block)

    old_stage = project.current_stage
    project.current_stage = target_stage
    await _sync_stage_rows(session, project_id, old_stage, target_stage)

    payload = {
        "event": "stage_changed",
        "from": old_stage,
        "stage": target_stage,
    }
    await publish_workflow_event(str(project_id), payload)
    await push_workflow_event_list(str(project_id), payload)

    return await get_workflow_view(session, project_id)


async def confirm_human(
    session: AsyncSession, project_id: uuid.UUID, checkpoint: str, approved: bool
) -> dict:
    from app.orchestration.stages import HUMAN_CHECKPOINTS

    if checkpoint not in HUMAN_CHECKPOINTS:
        raise ValidationError("Unknown checkpoint")
    result = await session.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise AppError("Project not found", code="not_found")

    raw = dict(project.hitl) if isinstance(project.hitl, dict) else {}
    raw[checkpoint] = approved
    project.hitl = raw

    payload = {
        "event": "human_confirmed" if approved else "human_rejected",
        "checkpoint": checkpoint,
        "approved": approved,
    }
    await publish_workflow_event(str(project_id), payload)
    await push_workflow_event_list(str(project_id), payload)

    return await get_workflow_view(session, project_id)
