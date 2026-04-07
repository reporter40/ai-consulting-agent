"""Initial schema: consultants, projects, stages, artifacts, hypotheses, questionnaires, llm_audit.

Revision ID: 001
Revises:
Create Date: 2026-04-05

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create each PG ENUM once (create_type=True), then separate ENUM(..., create_type=False)
    # for columns — otherwise create_table emits CREATE TYPE again (asyncpg duplicate error).
    _ps = postgresql.ENUM(
        "draft", "active", "paused", "completed", name="project_status", create_type=True
    )
    _ss = postgresql.ENUM(
        "pending", "active", "completed", "skipped", name="stage_status", create_type=True
    )
    _at = postgresql.ENUM(
        "questionnaire",
        "hypothesis",
        "report",
        "stakeholder_map",
        name="artifact_type",
        create_type=True,
    )
    _hs = postgresql.ENUM(
        "generated",
        "validated",
        "rejected",
        "selected",
        name="hypothesis_status",
        create_type=True,
    )
    _ps.create(op.get_bind(), checkfirst=True)
    _ss.create(op.get_bind(), checkfirst=True)
    _at.create(op.get_bind(), checkfirst=True)
    _hs.create(op.get_bind(), checkfirst=True)

    project_status = postgresql.ENUM(
        "draft", "active", "paused", "completed", name="project_status", create_type=False
    )
    stage_status = postgresql.ENUM(
        "pending", "active", "completed", "skipped", name="stage_status", create_type=False
    )
    artifact_type = postgresql.ENUM(
        "questionnaire",
        "hypothesis",
        "report",
        "stakeholder_map",
        name="artifact_type",
        create_type=False,
    )
    hypothesis_status = postgresql.ENUM(
        "generated",
        "validated",
        "rejected",
        "selected",
        name="hypothesis_status",
        create_type=False,
    )

    op.create_table(
        "consultants",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("client_name", sa.String(length=255), nullable=False),
        sa.Column("status", project_status, nullable=False),
        sa.Column("current_stage", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consultant_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["consultant_id"], ["consultants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_projects_consultant_id", "projects", ["consultant_id"])
    op.create_table(
        "stages",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stage_name", sa.String(length=100), nullable=False),
        sa.Column("status", stage_status, nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("iqd_score", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_stages_project_id", "stages", ["project_id"])
    op.create_table(
        "artifacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stage_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("type", artifact_type, nullable=False),
        sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.ForeignKeyConstraint(["stage_id"], ["stages.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_artifacts_project_id", "artifacts", ["project_id"])
    op.create_table(
        "hypotheses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False),
        sa.Column("confidence_level", sa.String(length=1), nullable=False),
        sa.Column("evidence", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("sources", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("status", hypothesis_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hypotheses_project_id", "hypotheses", ["project_id"])
    op.create_table(
        "questionnaires",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("target_role", sa.String(length=100), nullable=False),
        sa.Column("questions", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("responses", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("iqd_score", sa.Float(), nullable=True),
        sa.Column("distortion_flags", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_questionnaires_project_id", "questionnaires", ["project_id"])
    op.create_table(
        "llm_audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("model", sa.String(length=128), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("request_summary", sa.Text(), nullable=False),
        sa.Column("response_summary", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_llm_audit_project_id", "llm_audit_logs", ["project_id"])


def downgrade() -> None:
    op.drop_index("ix_llm_audit_project_id", table_name="llm_audit_logs")
    op.drop_table("llm_audit_logs")
    op.drop_index("ix_questionnaires_project_id", table_name="questionnaires")
    op.drop_table("questionnaires")
    op.drop_index("ix_hypotheses_project_id", table_name="hypotheses")
    op.drop_table("hypotheses")
    op.drop_index("ix_artifacts_project_id", table_name="artifacts")
    op.drop_table("artifacts")
    op.drop_index("ix_stages_project_id", table_name="stages")
    op.drop_table("stages")
    op.drop_index("ix_projects_consultant_id", table_name="projects")
    op.drop_table("projects")
    op.drop_table("consultants")
    sa.Enum(name="hypothesis_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="artifact_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="stage_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="project_status").drop(op.get_bind(), checkfirst=True)
