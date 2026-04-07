"""Knowledge graph status (Neo4j version, counts)."""

from fastapi import APIRouter

from app.services import kg_service

router = APIRouter(prefix="/api/knowledge-graph", tags=["knowledge-graph"])


@router.get("/status")
async def knowledge_graph_status() -> dict:
    """Meta node, label counts — for dashboards and ops."""
    try:
        meta = await kg_service.get_graph_meta()
        counts = await kg_service.count_nodes_by_label()
        return {
            "connected": True,
            "meta": meta,
            "counts": counts,
        }
    except Exception as exc:
        return {
            "connected": False,
            "error": str(exc),
            "meta": None,
            "counts": [],
        }
