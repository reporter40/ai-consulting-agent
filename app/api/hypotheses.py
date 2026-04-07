"""Hypothesis generation and verification."""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.exceptions import AppError
from app.models.hypothesis import Hypothesis
from app.schemas.hypothesis import (
    HypothesisGenerateRequest,
    HypothesisRead,
    HypothesisSelectRequest,
    HypothesisVerifyRequest,
)
from app.services.hypothesis_service import (
    generate_hypotheses,
    select_hypothesis_for_project,
    verify_all_for_project,
    verify_hypothesis_for_project,
)

router = APIRouter(prefix="/api/projects/{project_id}/hypotheses", tags=["hypotheses"])


@router.get("", response_model=list[HypothesisRead])
async def list_hypotheses(
    project_id: UUID, session: AsyncSession = Depends(get_db)
) -> list[HypothesisRead]:
    result = await session.execute(select(Hypothesis).where(Hypothesis.project_id == project_id))
    rows = result.scalars().all()
    return [HypothesisRead.model_validate(h) for h in rows]


@router.post("/generate", response_model=list[HypothesisRead])
async def post_generate(
    project_id: UUID,
    body: HypothesisGenerateRequest,
    session: AsyncSession = Depends(get_db),
) -> list[HypothesisRead]:
    hyps = await generate_hypotheses(session, project_id, body.context_summary)
    return [HypothesisRead.model_validate(h) for h in hyps]


@router.post("/verify", response_model=HypothesisRead)
async def post_verify(
    project_id: UUID,
    body: HypothesisVerifyRequest,
    session: AsyncSession = Depends(get_db),
) -> HypothesisRead:
    h = await verify_hypothesis_for_project(session, project_id, body.hypothesis_id)
    if h is None:
        raise AppError("Hypothesis not found for this project", code="not_found")
    return HypothesisRead.model_validate(h)


@router.post("/verify-all", response_model=list[HypothesisRead])
async def post_verify_all(
    project_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> list[HypothesisRead]:
    hyps = await verify_all_for_project(session, project_id)
    return [HypothesisRead.model_validate(h) for h in hyps]


@router.post("/select", response_model=HypothesisRead)
async def post_select(
    project_id: UUID,
    body: HypothesisSelectRequest,
    session: AsyncSession = Depends(get_db),
) -> HypothesisRead:
    h = await select_hypothesis_for_project(session, project_id, body.hypothesis_id)
    if h is None:
        raise AppError("Hypothesis not found for this project", code="not_found")
    return HypothesisRead.model_validate(h)
