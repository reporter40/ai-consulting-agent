"""Diagnostic agent: LLM streaming (Anthropic or Abacus RouteLLM) + audit log."""

from __future__ import annotations

import re
import uuid
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.llm_audit import LLMAuditLog
from app.services.kg_service import fetch_method_summaries
from app.services.llm_client import llm_is_configured, stream_chat_tokens

_PROMPT_DIR = Path(__file__).resolve().parents[2] / "prompts" / "system"

_PROMPT_BY_MODE: dict[str, str] = {
    "analytic": "diagnostic_system.txt",
    "questionnaire": "questionnaire_system.txt",
}

_MAX_COMBINED_USER_CHARS = 120_000


def merge_message_and_field_materials(
    user_message: str,
    attachments: list[tuple[str, str]],
) -> str:
    """Склеивает запрос консультанта и тексты полевых материалов."""
    parts: list[str] = []
    msg = (user_message or "").strip()
    if msg:
        parts.append(msg)
    for name, text in attachments:
        t = (text or "").strip()
        if not t:
            continue
        parts.append(
            f"\n\n---\n### Материалы полевого исследования: {name}\n---\n{t}"
        )
    merged = "\n".join(parts)
    if len(merged) > _MAX_COMBINED_USER_CHARS:
        merged = (
            merged[:_MAX_COMBINED_USER_CHARS]
            + "\n\n[…текст обрезан по лимиту модели]"
        )
    return merged


def _anonymize(text: str) -> str:
    """Strip common PII patterns from audit-bound text."""
    text = re.sub(r"[\w.\-+]+@[\w\-]+\.[\w.\-]+", "[email]", text)
    text = re.sub(
        r"\b(?:\+?7|8)[\s\-]?(?:\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2})\b",
        "[phone]",
        text,
    )
    return text


def _load_system_prompt(mode: str) -> str:
    name = _PROMPT_BY_MODE.get(mode, _PROMPT_BY_MODE["analytic"])
    path = _PROMPT_DIR / name
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "You are a helpful diagnostic assistant."


async def stream_diagnostic(
    session: AsyncSession,
    project_id: uuid.UUID,
    user_message: str,
    temperature: float = 0.3,
    mode: str = "analytic",
    *,
    attachment_parts: list[tuple[str, str]] | None = None,
):
    """Async generator of text chunks; persists audit row on success."""
    settings = get_settings()
    att = attachment_parts or []
    combined = merge_message_and_field_materials(user_message, att)
    msg_for_audit = _anonymize(combined)

    if not llm_is_configured(settings):
        yield "[LLM disabled: set ANTHROPIC_API_KEY or ABACUS_API_KEY]\n"
        return

    methods = await fetch_method_summaries()
    kg_context = "\n".join(f"- {m}" for m in methods[:5])
    system = _load_system_prompt(mode)
    system_full = f"{system}\n\nKnowledge graph (sample):\n{kg_context}"

    full_response: list[str] = []

    try:
        async for text in stream_chat_tokens(
            settings, system_full, combined, temperature
        ):
            full_response.append(text)
            yield text
    except Exception as e:  # noqa: BLE001 — stream errors surfaced to client
        yield f"\n[error: {e}]\n"
        return

    summary_req = (msg_for_audit[:500] + "…") if len(msg_for_audit) > 500 else msg_for_audit
    summary_resp = "".join(full_response)
    summary_resp = _anonymize(summary_resp)
    summary_resp = (summary_resp[:800] + "…") if len(summary_resp) > 800 else summary_resp

    row = LLMAuditLog(
        project_id=project_id,
        model=settings.llm_model,
        temperature=temperature,
        request_summary=summary_req,
        response_summary=summary_resp,
    )
    session.add(row)
    await session.flush()
