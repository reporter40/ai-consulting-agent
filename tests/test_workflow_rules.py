"""HITL gate rules."""

from app.orchestration.workflow_rules import hitl_error_for_transition


def test_no_block_when_same_stage() -> None:
    assert hitl_error_for_transition("analysis", "analysis", {}) is None


def test_block_hypothesis_to_report_without_confirm() -> None:
    err = hitl_error_for_transition(
        "hypothesis_synthesis", "report_review", {}
    )
    assert err is not None


def test_allow_hypothesis_to_report_after_confirm() -> None:
    assert (
        hitl_error_for_transition(
            "hypothesis_synthesis",
            "report_review",
            {"method_selection": True},
        )
        is None
    )


def test_block_report_to_completed_without_confirm() -> None:
    assert hitl_error_for_transition("report_review", "completed", {}) is not None


def test_allow_report_to_completed_after_confirm() -> None:
    assert (
        hitl_error_for_transition(
            "report_review",
            "completed",
            {"final_report": True},
        )
        is None
    )
