"""LangGraph StateGraph for the consulting workflow."""

from __future__ import annotations

from langgraph.graph import END, StateGraph

from app.orchestration.stages import STAGE_ORDER
from app.orchestration.state import WorkflowState


def _make_stage_node(stage_name: str):
    def _node(state: WorkflowState) -> WorkflowState:
        return {
            **state,
            "current_stage": stage_name,
            "last_event": f"entered:{stage_name}",
        }

    return _node


def build_workflow_graph():
    """Compile LangGraph for the linear stage machine with conditional end."""
    graph = StateGraph(WorkflowState)
    for s in STAGE_ORDER:
        graph.add_node(f"stage__{s}", _make_stage_node(s))

    graph.set_entry_point(f"stage__{STAGE_ORDER[0]}")
    for i, s in enumerate(STAGE_ORDER):
        node_name = f"stage__{s}"
        if i == len(STAGE_ORDER) - 1:
            graph.add_edge(node_name, END)
        else:
            nxt = STAGE_ORDER[i + 1]
            graph.add_edge(node_name, f"stage__{nxt}")
    return graph.compile()


compiled_workflow = build_workflow_graph()
