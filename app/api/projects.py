"""Projects CRUD."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.exceptions import AppError
from app.models.project import Project, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectList, ProjectRead

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=ProjectList)
async def list_projects(session: AsyncSession = Depends(get_db)) -> ProjectList:
    count_q = await session.execute(select(func.count()).select_from(Project))
    total = int(count_q.scalar_one())
    result = await session.execute(select(Project).order_by(Project.created_at.desc()))
    rows = result.scalars().all()
    return ProjectList(items=[ProjectRead.model_validate(r) for r in rows], total=total)


@router.post("", response_model=ProjectRead)
async def create_project(
    body: ProjectCreate, session: AsyncSession = Depends(get_db)
) -> ProjectRead:
    p = Project(
        name=body.name,
        client_name=body.client_name,
        status=ProjectStatus.draft,
        consultant_id=body.consultant_id,
        hitl={},
    )
    session.add(p)
    await session.flush()
    await session.refresh(p)
    return ProjectRead.model_validate(p)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: UUID, session: AsyncSession = Depends(get_db)
) -> ProjectRead:
    result = await session.execute(select(Project).where(Project.id == project_id))
    p = result.scalar_one_or_none()
    if p is None:
        raise AppError("Project not found", code="not_found")
    return ProjectRead.model_validate(p)
