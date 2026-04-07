"""Workflow API endpoint behavior with dependency overrides."""

from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from fastapi.testclient import TestClient

from app.api import workflow as workflow_api
from app.db.session import get_db
from app.main import app
from app.schemas.workflow import WorkflowStateResponse

client = TestClient(app)


def _override_db():
    async def _inner():
        yield MagicMock()

    return _inner


def test_confirm_endpoint_supports_approve_and_reject() -> None:
    fake = UUID("00000000-0000-4000-8000-000000000011")
    payload = {
        "project_id": str(fake),
        "current_stage": "hypothesis_synthesis",
        "allowed_next": ["report_review"],
        "awaiting_human": True,
        "human_checkpoint": "method_selection",
        "hitl": {"method_selection": False},
    }
    mocked = AsyncMock(return_value=payload)
    original = workflow_api.confirm_human
    app.dependency_overrides[get_db] = _override_db()
    workflow_api.confirm_human = mocked
    try:
        r1 = client.post(
            f"/api/projects/{fake}/workflow/confirm",
            json={"checkpoint": "method_selection", "approved": True},
        )
        r2 = client.post(
            f"/api/projects/{fake}/workflow/confirm",
            json={"checkpoint": "method_selection", "approved": False},
        )
        assert r1.status_code == 200
        assert r2.status_code == 200
        WorkflowStateResponse(**r1.json())
        WorkflowStateResponse(**r2.json())
        assert mocked.await_count == 2
        assert mocked.await_args_list[0].args[2:] == ("method_selection", True)
        assert mocked.await_args_list[1].args[2:] == ("method_selection", False)
    finally:
        workflow_api.confirm_human = original
        app.dependency_overrides.clear()

