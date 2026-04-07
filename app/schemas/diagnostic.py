"""Diagnostic streaming request."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator


class AttachmentIn(BaseModel):
    """Текст материала полевого исследования (имя файла + извлечённый текст)."""

    filename: str = Field(..., max_length=512)
    text: str = Field(..., max_length=120_000)


class DiagnosticStreamRequest(BaseModel):
    message: str = Field(default="", max_length=16000)
    temperature: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Override; default 0.3 analytic, 0.7 questionnaire",
    )
    mode: Literal["analytic", "questionnaire"] = "analytic"
    attachments: list[AttachmentIn] = Field(
        default_factory=list,
        max_length=20,
        description="Материалы полевых исследований (текст с клиента или после парсинга)",
    )

    @model_validator(mode="after")
    def require_message_or_attachments(self) -> "DiagnosticStreamRequest":
        has_msg = bool((self.message or "").strip())
        has_att = any((a.text or "").strip() for a in self.attachments)
        if not has_msg and not has_att:
            raise ValueError(
                "Нужен текст запроса консультанта и/или вложения с материалами полевых исследований"
            )
        return self

    def effective_temperature(self) -> float:
        if self.temperature is not None:
            return self.temperature
        return 0.7 if self.mode == "questionnaire" else 0.3
