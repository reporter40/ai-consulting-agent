"""Unit tests for workflow stage ordering."""

import pytest

from app.orchestration.stages import can_transition, index_of, next_stage


def test_next_stage_linear() -> None:
    assert next_stage("intake") == "data_collection"
    assert next_stage("report_review") == "completed"
    assert next_stage("completed") is None


def test_can_transition_only_forward_one_step() -> None:
    assert can_transition("intake", "intake") is True
    assert can_transition("intake", "data_collection") is True
    assert can_transition("intake", "analysis") is False
    assert can_transition("analysis", "intake") is False


def test_index_of_raises() -> None:
    with pytest.raises(ValueError):
        index_of("unknown_stage")
