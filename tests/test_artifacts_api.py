"""Artifacts API with DB dependency overridden (no live Postgres)."""

from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.main import app

client = TestClient(app)


def test_list_artifacts_empty_project() -> None:
    """Returns 200 and empty list without touching a real database."""

    async def override_get_db():
        session = MagicMock()
        result = MagicMock()
        result.scalars.return_value.all.return_value = []
        session.execute = AsyncMock(return_value=result)
        yield session

    app.dependency_overrides[get_db] = override_get_db
    try:
        fake = UUID("00000000-0000-4000-8000-000000000001")
        response = client.get(f"/api/projects/{fake}/artifacts")
        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides.clear()
