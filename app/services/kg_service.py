"""Knowledge graph queries (Neo4j)."""

from __future__ import annotations

from typing import Any

from app.db.neo4j_client import get_neo4j_driver


async def fetch_method_summaries(limit: int = 10) -> list[dict[str, Any]]:
    """Return a small sample of Method nodes for LLM grounding."""
    driver = get_neo4j_driver()
    query = """
    MATCH (m:Method)
    RETURN m.id AS id, m.name AS name, m.source AS source, m.version AS version
    LIMIT $limit
    """
    records: list[dict[str, Any]] = []
    async with driver.session() as session:
        result = await session.run(query, limit=limit)
        async for record in result:
            records.append(dict(record))
    return records


async def get_graph_meta() -> dict[str, Any] | None:
    """Return KnowledgeGraphMeta singleton properties if present."""
    driver = get_neo4j_driver()
    query = """
    MATCH (k:KnowledgeGraphMeta)
    RETURN k.id AS id, k.version AS version, k.source AS source,
           k.changelog_ref AS changelog_ref, k.updated_at AS updated_at
    LIMIT 1
    """
    async with driver.session() as session:
        result = await session.run(query)
        rec = await result.single()
        if rec is None:
            return None
        return dict(rec)


async def count_nodes_by_label() -> list[dict[str, Any]]:
    """Count nodes per primary label (excludes pure relationship-only structures)."""
    driver = get_neo4j_driver()
    query = """
    MATCH (n)
    WITH n, head(labels(n)) AS label
    RETURN label AS label, count(*) AS count
    ORDER BY label
    """
    rows: list[dict[str, Any]] = []
    async with driver.session() as session:
        result = await session.run(query)
        async for record in result:
            rows.append({"label": record["label"], "count": record["count"]})
    return rows


async def nodes_exist_by_id(node_ids: list[str]) -> dict[str, bool]:
    """Check whether a node with property `id` exists (any label)."""
    if not node_ids:
        return {}
    driver = get_neo4j_driver()
    query = """
    UNWIND $ids AS id
    OPTIONAL MATCH (n {id: id})
    RETURN id, n IS NOT NULL AS exists
    """
    out: dict[str, bool] = {}
    async with driver.session() as session:
        result = await session.run(query, ids=node_ids)
        async for record in result:
            out[str(record["id"])] = bool(record["exists"])
    return out
