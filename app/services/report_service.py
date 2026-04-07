"""Branded PDF report generation (ReportLab)."""

from __future__ import annotations

import io
import uuid
from datetime import datetime, timezone
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundError
from app.models.artifact import Artifact, ArtifactType
from app.models.hypothesis import Hypothesis
from app.models.project import Project
from app.pdf_fonts import ensure_pdf_cyrillic_fonts
from app.services.iqd_service import aggregate_iqd_for_project


def _p(text: str, style) -> Paragraph:
    safe = escape(text).replace("\n", "<br/>")
    return Paragraph(safe, style)


async def build_report_pdf(session: AsyncSession, project_id: uuid.UUID) -> bytes:
    """Build analytical PDF and persist report artifact row."""
    fn, fb = ensure_pdf_cyrillic_fonts()

    result = await session.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise NotFoundError("Project not found")

    hy_res = await session.execute(select(Hypothesis).where(Hypothesis.project_id == project_id))
    hypotheses = list(hy_res.scalars().all())

    iqd = await aggregate_iqd_for_project(session, project_id)
    avg = iqd.get("average_iqd")
    avg_pct = f"{round(avg * 100)}%" if avg is not None else "—"

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        title=f"Отчёт — {project.name}",
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleRU",
        parent=styles["Title"],
        fontName=fb,
        fontSize=18,
        leading=22,
        spaceAfter=12,
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName=fb,
        fontSize=13,
        spaceBefore=14,
        spaceAfter=8,
    )
    body = ParagraphStyle(
        "BodyRU",
        parent=styles["Normal"],
        fontName=fn,
        fontSize=10,
        leading=14,
    )
    small = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontName=fn,
        fontSize=8,
        textColor=colors.grey,
        leading=10,
    )

    story: list = []
    story.append(_p("Консультационно-аналитическая группа", title_style))
    story.append(_p("Аналитический отчёт (черновик)", h2))
    story.append(Spacer(1, 0.2 * cm))
    story.append(_p(f"<b>Проект:</b> {project.name}", body))
    story.append(_p(f"<b>Клиент (метка):</b> {project.client_name}", body))
    story.append(_p(f"<b>Стадия:</b> {project.current_stage}", body))
    story.append(
        _p(
            f"<b>Сформировано (UTC):</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
            body,
        )
    )
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("<b>Индекс качества данных (IQD)</b>", h2))
    story.append(_p(f"Среднее по этапам/опросникам: <b>{avg_pct}</b>", body))
    if iqd.get("needs_more_data"):
        story.append(
            _p(
                "Порог ниже 60% — рекомендуется расширить выборку или уточнить вопросы.",
                body,
            )
        )
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph("<b>Гипотезы</b>", h2))
    if not hypotheses:
        story.append(_p("Гипотезы ещё не сформированы.", body))
    else:
        data = [["Уровень", "Статус", "Текст (фрагмент)", "Связи графа"]]
        for h in hypotheses[:15]:
            refs = h.sources if isinstance(h.sources, dict) else {}
            gr = refs.get("graph_refs") if isinstance(refs, dict) else []
            refs_s = ", ".join(str(x) for x in gr[:5]) if isinstance(gr, list) else "—"
            if len(refs_s) > 120:
                refs_s = refs_s[:117] + "…"
            txt = (h.text or "")[:180]
            if len(h.text or "") > 180:
                txt += "…"
            data.append(
                [
                    h.confidence_level,
                    h.status.value,
                    txt,
                    refs_s or "—",
                ]
            )
        t = Table(data, colWidths=[1.2 * cm, 2.2 * cm, 7.5 * cm, 4.5 * cm])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("FONTNAME", (0, 0), (-1, 0), fb),
                    ("FONTNAME", (0, 1), (-1, -1), fn),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ]
            )
        )
        story.append(t)

    story.append(Spacer(1, 0.6 * cm))
    story.append(
        Paragraph("<b>Методология и источники</b>", h2),
    )
    story.append(
        _p(
            "Выводы с пометкой [UNVERIFIED] или без подтверждённых ссылок на узлы графа знаний "
            "требуют дополнительной проверки консультантом.",
            body,
        )
    )
    story.append(Spacer(1, 0.8 * cm))
    story.append(
        _p(
            "Внутренний документ. Не предназначен для распространения без согласования.",
            small,
        )
    )

    doc.build(story)
    pdf = buf.getvalue()

    art = Artifact(
        project_id=project_id,
        stage_id=None,
        type=ArtifactType.report,
        content={
            "format": "pdf",
            "title": project.name,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "iqd_average": avg,
        },
        version=1,
    )
    session.add(art)
    await session.flush()
    return pdf
