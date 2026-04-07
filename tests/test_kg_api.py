"""Knowledge graph API returns graceful payload when Neo4j is down."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_kg_status_returns_payload() -> None:
    response = client.get("/api/knowledge-graph/status")
    assert response.status_code == 200
    body = response.json()
    assert "connected" in body
    assert "meta" in body
    assert "counts" in body
