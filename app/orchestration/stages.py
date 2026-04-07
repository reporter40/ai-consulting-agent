"""Ordered diagnostic stages — no skipping allowed."""

from __future__ import annotations

# Canonical order for the consulting workflow (state machine).
STAGE_ORDER: tuple[str, ...] = (
    "intake",
    "data_collection",
    "analysis",
    "hypothesis_synthesis",
    "report_review",
    "completed",
)

HUMAN_CHECKPOINTS: frozenset[str] = frozenset(
    {"method_selection", "final_report"}
)


def index_of(stage: str) -> int:
    """Return index of stage or raise ValueError."""
    if stage not in STAGE_ORDER:
        raise ValueError(f"Unknown stage: {stage}")
    return STAGE_ORDER.index(stage)


def next_stage(current: str) -> str | None:
    """Return the next stage in order, or None if already completed."""
    idx = index_of(current)
    if idx >= len(STAGE_ORDER) - 1:
        return None
    return STAGE_ORDER[idx + 1]


def can_transition(from_stage: str, to_stage: str) -> bool:
    """Only single-step forward transitions (and staying on same)."""
    if from_stage == to_stage:
        return True
    return next_stage(from_stage) == to_stage
