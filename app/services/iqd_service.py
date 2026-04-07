"""IQD aggregates (shared by API and PDF report)."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.questionnaire import Questionnaire
from app.models.stage import Stage


async def aggregate_iqd_for_project(
    session: AsyncSession, project_id: uuid.UUID
) -> dict:
    st = await session.execute(select(Stage).where(Stage.project_id == project_id))
    stages = st.scalars().all()
    qs = await session.execute(
        select(Questionnaire).where(Questionnaire.project_id == project_id)
    )
    questionnaires = qs.scalars().all()
    iqd_scores = [s.iqd_score for s in stages if s.iqd_score is not None]
    q_scores = [q.iqd_score for q in questionnaires if q.iqd_score is not None]
    all_scores = iqd_scores + q_scores
    avg = sum(all_scores) / len(all_scores) if all_scores else None
    low = avg is not None and avg < 0.6
    return {
        "project_id": str(project_id),
        "average_iqd": avg,
        "needs_more_data": low,
        "stage_scores": [{"stage": s.stage_name, "iqd": s.iqd_score} for s in stages],
        "questionnaire_scores": [
            {"id": str(q.id), "iqd": q.iqd_score} for q in questionnaires
        ],
    }
