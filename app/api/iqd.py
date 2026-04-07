"""IQD aggregate metrics."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.iqd_service import aggregate_iqd_for_project

router = APIRouter(prefix="/api/projects/{project_id}/iqd", tags=["iqd"])


@router.get("")
async def get_iqd(project_id: UUID, session: AsyncSession = Depends(get_db)) -> dict:
    return await aggregate_iqd_for_project(session, project_id)
