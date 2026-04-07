"""Hypothesis generation and verification (3 competing hypotheses)."""

from __future__ import annotations

import json
import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.hypothesis import Hypothesis, HypothesisStatus
from app.models.llm_audit import LLMAuditLog
from app.services.kg_service import fetch_method_summaries, nodes_exist_by_id
from app.services.llm_client import complete_chat_text, llm_is_configured


def _level_from_score(score: float) -> str:
    if score >= 0.8:
        return "A"
    if score >= 0.5:
        return "B"
    return "C"


def _offline_hypotheses(project_id: uuid.UUID, methods: list) -> list[Hypothesis]:
    first_ref: list[str] = []
    if methods and isinstance(methods[0], dict) and methods[0].get("id"):
        first_ref = [str(methods[0]["id"])]
    return [
        Hypothesis(
            project_id=project_id,
            text="[Offline] Гипотеза A: структурный разрыв между стратегией и операциями.",
            confidence_score=0.55,
            confidence_level="B",
            evidence=[],
            sources={"graph_refs": first_ref},
            status=HypothesisStatus.generated,
        ),
        Hypothesis(
            project_id=project_id,
            text="[Offline] Гипотеза B: недостаток доверия в горизонтальных связях.",
            confidence_score=0.48,
            confidence_level="C",
            evidence=[],
            sources={"graph_refs": []},
            status=HypothesisStatus.generated,
        ),
        Hypothesis(
            project_id=project_id,
            text="[Offline] Гипотеза C: искажения данных при сборе обратной связи.",
            confidence_score=0.62,
            confidence_level="B",
            evidence=[],
            sources={"graph_refs": []},
            status=HypothesisStatus.generated,
        ),
    ]


async def generate_hypotheses(
    session: AsyncSession, project_id: uuid.UUID, context_summary: str
) -> list[Hypothesis]:
    """Create at least three competing hypotheses via LLM; store in DB."""
    settings = get_settings()
    methods = await fetch_method_summaries()
    if not llm_is_configured(settings):
        hyps = _offline_hypotheses(project_id, methods)
        for h in hyps:
            session.add(h)
        await session.flush()
        return hyps

    prompt = f"""Ты аналитик организационного развития. По обезличенному контексту сформулируй РОВНО 3
конкурирующие гипотезы. Для каждой: краткий текст, confidence 0-1, evidence bullets, graph_refs (id узлов или пусто).
Ответ СТРОГО JSON массив из 3 объектов: {{"text","confidence","evidence","graph_refs"}}.
Контекст: {context_summary}
"""
    text, _ = await complete_chat_text(
        settings, prompt, temperature=0.3, max_tokens=2048
    )
    session.add(
        LLMAuditLog(
            project_id=project_id,
            model=settings.llm_model,
            temperature=0.3,
            request_summary=prompt[:500],
            response_summary=text[:800],
        )
    )

    items: list[dict] = []
    try:
        m = re.search(r"\[[\s\S]*\]", text)
        if m:
            items = json.loads(m.group())
    except json.JSONDecodeError:
        items = []

    if len(items) < 3:
        hyps = _offline_hypotheses(project_id, methods)
        for h in hyps:
            session.add(h)
        await session.flush()
        return hyps

    out: list[Hypothesis] = []
    for raw in items[:3]:
        score = float(raw.get("confidence", 0.4))
        h = Hypothesis(
            project_id=project_id,
            text=str(raw.get("text", "")),
            confidence_score=score,
            confidence_level=_level_from_score(score),
            evidence=raw.get("evidence") or [],
            sources={"graph_refs": raw.get("graph_refs") or []},
            status=HypothesisStatus.generated,
        )
        session.add(h)
        out.append(h)
    await session.flush()
    return out


async def _verify_hypothesis_row(
    session: AsyncSession, hyp: Hypothesis
) -> Hypothesis:
    """Set status to validated only if every graph_ref id exists in Neo4j."""
    refs = hyp.sources if isinstance(hyp.sources, dict) else {}
    graph_refs = refs.get("graph_refs") if isinstance(refs, dict) else []
    if not isinstance(graph_refs, list) or len(graph_refs) == 0:
        hyp.status = HypothesisStatus.generated
        await session.flush()
        return hyp
    ids = [str(x) for x in graph_refs]
    try:
        existence = await nodes_exist_by_id(ids)
    except Exception:
        hyp.status = HypothesisStatus.generated
        await session.flush()
        return hyp
    if all(existence.get(i, False) for i in ids):
        hyp.status = HypothesisStatus.validated
    else:
        hyp.status = HypothesisStatus.generated
    await session.flush()
    return hyp


async def verify_against_graph(
    session: AsyncSession, hypothesis_id: uuid.UUID
) -> Hypothesis | None:
    """Verify by id only (internal / tests)."""
    result = await session.execute(select(Hypothesis).where(Hypothesis.id == hypothesis_id))
    hyp = result.scalar_one_or_none()
    if hyp is None:
        return None
    return await _verify_hypothesis_row(session, hyp)


async def verify_hypothesis_for_project(
    session: AsyncSession, project_id: uuid.UUID, hypothesis_id: uuid.UUID
) -> Hypothesis | None:
    """Verify only if the hypothesis belongs to the project."""
    result = await session.execute(
        select(Hypothesis).where(
            Hypothesis.id == hypothesis_id,
            Hypothesis.project_id == project_id,
        )
    )
    hyp = result.scalar_one_or_none()
    if hyp is None:
        return None
    return await _verify_hypothesis_row(session, hyp)


async def verify_all_for_project(
    session: AsyncSession, project_id: uuid.UUID
) -> list[Hypothesis]:
    result = await session.execute(
        select(Hypothesis).where(Hypothesis.project_id == project_id)
    )
    rows = list(result.scalars().all())
    out: list[Hypothesis] = []
    for hyp in rows:
        out.append(await _verify_hypothesis_row(session, hyp))
    return out


async def select_hypothesis_for_project(
    session: AsyncSession, project_id: uuid.UUID, hypothesis_id: uuid.UUID
) -> Hypothesis | None:
    """Mark one hypothesis as selected; clear previous selection."""
    result = await session.execute(
        select(Hypothesis).where(
            Hypothesis.id == hypothesis_id,
            Hypothesis.project_id == project_id,
        )
    )
    chosen = result.scalar_one_or_none()
    if chosen is None:
        return None
    all_h = await session.execute(
        select(Hypothesis).where(Hypothesis.project_id == project_id)
    )
    for h in all_h.scalars().all():
        if h.id == hypothesis_id:
            h.status = HypothesisStatus.selected
        elif h.status == HypothesisStatus.selected:
            h.status = HypothesisStatus.generated
    await session.flush()
    return chosen
