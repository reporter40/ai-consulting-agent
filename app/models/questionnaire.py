"""Questionnaire model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Questionnaire(Base):
    __tablename__ = "questionnaires"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"))
    target_role: Mapped[str] = mapped_column(String(100), nullable=False)
    questions: Mapped[list | dict] = mapped_column(JSONB, nullable=False, default=list)
    responses: Mapped[list | dict] = mapped_column(JSONB, nullable=False, default=dict)
    iqd_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    distortion_flags: Mapped[list | dict] = mapped_column(JSONB, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="questionnaires")
