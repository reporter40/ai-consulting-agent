"""PDF report download."""

from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.report_service import build_report_pdf

router = APIRouter(prefix="/api/projects/{project_id}/report", tags=["report"])


@router.get("/pdf")
async def get_pdf(project_id: UUID, session: AsyncSession = Depends(get_db)) -> Response:
    pdf_bytes = await build_report_pdf(session, project_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="report-{project_id}.pdf"'},
    )
