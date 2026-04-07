"""Project model."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProjectStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    completed = "completed"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, name="project_status"),
        nullable=False,
        default=ProjectStatus.draft,
    )
    current_stage: Mapped[str] = mapped_column(String(50), nullable=False, default="intake")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )
    consultant_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("consultants.id"), nullable=True
    )
    hitl: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    consultant: Mapped["Consultant | None"] = relationship("Consultant", back_populates="projects")
    stages: Mapped[list["Stage"]] = relationship("Stage", back_populates="project")
    artifacts: Mapped[list["Artifact"]] = relationship("Artifact", back_populates="project")
    hypotheses: Mapped[list["Hypothesis"]] = relationship("Hypothesis", back_populates="project")
    questionnaires: Mapped[list["Questionnaire"]] = relationship(
        "Questionnaire", back_populates="project"
    )
    llm_audit_logs: Mapped[list["LLMAuditLog"]] = relationship(
        "LLMAuditLog", back_populates="project"
    )
