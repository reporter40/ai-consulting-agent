"""Workflow / LangGraph REST."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.redis_client import list_workflow_events
from app.schemas.workflow import HumanConfirmRequest, WorkflowAdvanceRequest, WorkflowStateResponse
from app.services.workflow_service import advance_stage, confirm_human, get_workflow_view

router = APIRouter(prefix="/api/projects/{project_id}/workflow", tags=["workflow"])


@router.get("", response_model=WorkflowStateResponse)
async def workflow_state(
    project_id: UUID, session: AsyncSession = Depends(get_db)
) -> WorkflowStateResponse:
    data = await get_workflow_view(session, project_id)
    return WorkflowStateResponse(**data)


@router.post("/advance", response_model=WorkflowStateResponse)
async def workflow_advance(
    project_id: UUID,
    body: WorkflowAdvanceRequest,
    session: AsyncSession = Depends(get_db),
) -> WorkflowStateResponse:
    data = await advance_stage(session, project_id, body.target_stage)
    return WorkflowStateResponse(**data)


@router.post("/confirm", response_model=WorkflowStateResponse)
async def workflow_confirm(
    project_id: UUID,
    body: HumanConfirmRequest,
    session: AsyncSession = Depends(get_db),
) -> WorkflowStateResponse:
    data = await confirm_human(session, project_id, body.checkpoint, body.approved)
    return WorkflowStateResponse(**data)


@router.get("/events")
async def workflow_events(project_id: UUID, limit: int = 50) -> list[dict]:
    """Recent workflow events (Redis list; newest first)."""
    return await list_workflow_events(str(project_id), limit=limit)
