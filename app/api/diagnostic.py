"""Diagnostic streaming (SSE) and LLM audit listing."""

import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_factory, get_db
from app.models.llm_audit import LLMAuditLog
from app.schemas.diagnostic import AttachmentIn, DiagnosticStreamRequest
from app.schemas.llm_audit import LLMAuditRead
from app.services.diagnostic_service import stream_diagnostic
from app.config import get_settings
from app.services.file_text_extract import extract_text_from_bytes
from app.services.llm_client import llm_is_configured, resolve_llm_backend

router = APIRouter(prefix="/api/projects/{project_id}/diagnostic", tags=["diagnostic"])


def _sse_line(obj: dict) -> str:
    return f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"


async def _parse_diagnostic_request(request: Request) -> DiagnosticStreamRequest:
    """JSON (application/json) или multipart: message, mode, temperature?, files[]."""
    ct = (request.headers.get("content-type") or "").lower()
    if "multipart/form-data" in ct:
        form = await request.form()
        message = str(form.get("message") or "")
        mode = str(form.get("mode") or "analytic")
        temp_raw = form.get("temperature")
        try:
            temperature = (
                float(temp_raw) if temp_raw not in (None, "") else None
            )
        except (TypeError, ValueError):
            temperature = None
        raw_files = form.getlist("files")
        attachments: list[AttachmentIn] = []
        for item in raw_files:
            if not hasattr(item, "read"):
                continue
            data = await item.read()
            if not data:
                continue
            name = getattr(item, "filename", None) or "upload.bin"
            try:
                text = extract_text_from_bytes(name, data)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e)) from e
            attachments.append(AttachmentIn(filename=name, text=text))
        try:
            return DiagnosticStreamRequest.model_validate(
                {
                    "message": message,
                    "mode": mode,
                    "temperature": temperature,
                    "attachments": [a.model_dump() for a in attachments],
                }
            )
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=e.errors()) from e
    try:
        body = await request.json()
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=422, detail="Ожидался JSON или multipart") from e
    try:
        return DiagnosticStreamRequest.model_validate(body)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors()) from e


@router.post("/stream")
async def diagnostic_stream(project_id: UUID, request: Request) -> StreamingResponse:
    """Server-Sent Events: JSON или multipart (файлы полевых исследований)."""
    body = await _parse_diagnostic_request(request)
    settings = get_settings()
    temp = body.effective_temperature()
    att_parts = [(a.filename, a.text) for a in body.attachments]

    async def gen():
        async with async_session_factory() as session:
            try:
                yield _sse_line(
                    {
                        "type": "meta",
                        "mode": body.mode,
                        "temperature": temp,
                        "llm_enabled": llm_is_configured(settings),
                        "llm_backend": resolve_llm_backend(settings).value,
                        "attachments_count": len(body.attachments),
                    }
                )
                async for chunk in stream_diagnostic(
                    session,
                    project_id,
                    body.message,
                    temp,
                    body.mode,
                    attachment_parts=att_parts,
                ):
                    yield _sse_line({"type": "token", "text": chunk})
                yield _sse_line({"type": "done"})
                await session.commit()
            except Exception as e:  # noqa: BLE001
                await session.rollback()
                yield _sse_line({"type": "error", "message": str(e)})

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(gen(), media_type="text/event-stream", headers=headers)


@router.get("/audit", response_model=list[LLMAuditRead])
async def list_diagnostic_audit(
    project_id: UUID,
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
) -> list[LLMAuditRead]:
    """Recent LLM audit rows for this project (anonymized summaries)."""
    result = await session.execute(
        select(LLMAuditLog)
        .where(LLMAuditLog.project_id == project_id)
        .order_by(LLMAuditLog.created_at.desc())
        .limit(limit)
    )
    rows = result.scalars().all()
    return [LLMAuditRead.model_validate(r) for r in rows]
