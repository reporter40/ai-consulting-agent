"""Idempotent demo seed for development / Docker."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.artifact import Artifact, ArtifactType
from app.models.hypothesis import Hypothesis, HypothesisStatus
from app.models.project import Project, ProjectStatus


async def seed_demo_if_empty(session: AsyncSession) -> bool:
    """Insert two demo projects if the table is empty. Returns True if seed ran."""
    count = await session.scalar(select(func.count()).select_from(Project))
    if count and count > 0:
        return False

    p1 = Project(
        id=uuid.UUID("a1111111-1111-4111-8111-111111111101"),
        name="Диагностика Alpha Ltd",
        client_name="ООО «Альфа»",
        status=ProjectStatus.active,
        current_stage="analysis",
        consultant_id=None,
        hitl={},
    )
    p2 = Project(
        id=uuid.UUID("b2222222-2222-4222-8222-222222222202"),
        name="Оргразвитие Beta",
        client_name="АО «Бета»",
        status=ProjectStatus.draft,
        current_stage="intake",
        consultant_id=None,
        hitl={},
    )
    session.add_all([p1, p2])

    session.add_all(
        [
            Artifact(
                project_id=p1.id,
                stage_id=None,
                type=ArtifactType.questionnaire,
                content={"title": "Опрос руководителей", "note": "демо"},
                version=2,
            ),
            Artifact(
                project_id=p1.id,
                stage_id=None,
                type=ArtifactType.stakeholder_map,
                content={"title": "Карта стейкхолдеров"},
                version=1,
            ),
        ]
    )

    session.add_all(
        [
            Hypothesis(
                project_id=p1.id,
                text="Разрыв между заявленной стратегией и операционными решениями.",
                confidence_score=0.62,
                confidence_level="B",
                evidence=[],
                sources={"graph_refs": ["method_diag_interview"]},
                status=HypothesisStatus.generated,
            ),
            Hypothesis(
                project_id=p1.id,
                text="Низкая горизонтальная координация между подразделениями.",
                confidence_score=0.41,
                confidence_level="C",
                evidence=[],
                sources={},
                status=HypothesisStatus.generated,
            ),
            Hypothesis(
                project_id=p1.id,
                text="Искажения при сборе обратной связи (социально желательные ответы).",
                confidence_score=0.58,
                confidence_level="B",
                evidence=[],
                sources={"graph_refs": []},
                status=HypothesisStatus.generated,
            ),
        ]
    )

    await session.flush()
    return True
