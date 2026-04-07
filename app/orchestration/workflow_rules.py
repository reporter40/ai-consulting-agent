"""Pure rules for HITL gates (testable without DB)."""

from __future__ import annotations


def hitl_error_for_transition(
    from_stage: str, to_stage: str, hitl: dict[str, bool]
) -> str | None:
    """Return error message if advance must be blocked until human confirms."""
    if from_stage == to_stage:
        return None
    if from_stage == "hypothesis_synthesis" and to_stage == "report_review":
        if not hitl.get("method_selection"):
            return (
                "Требуется подтверждение консультанта: checkpoint method_selection "
                "(POST /workflow/confirm)."
            )
    if from_stage == "report_review" and to_stage == "completed":
        if not hitl.get("final_report"):
            return (
                "Требуется подтверждение консультанта: checkpoint final_report "
                "(POST /workflow/confirm)."
            )
    return None
