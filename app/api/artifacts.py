"""Artifacts listing."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.artifact import Artifact
from app.schemas.artifact import ArtifactRead

router = APIRouter(prefix="/api/projects/{project_id}/artifacts", tags=["artifacts"])


@router.get("", response_model=list[ArtifactRead])
async def list_artifacts(
    project_id: UUID, session: AsyncSession = Depends(get_db)
) -> list[ArtifactRead]:
    result = await session.execute(
        select(Artifact).where(Artifact.project_id == project_id).order_by(Artifact.created_at.desc())
    )
    rows = result.scalars().all()
    return [ArtifactRead.model_validate(a) for a in rows]
