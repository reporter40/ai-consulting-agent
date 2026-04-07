import type { HypothesisRead } from "@/lib/api-types";

/** No graph_refs in sources → treat as [UNVERIFIED] in UI. */
export function hypothesisIsUnverified(h: HypothesisRead): boolean {
  const s = h.sources;
  if (s == null || typeof s !== "object") return true;
  const refs = (s as Record<string, unknown>).graph_refs;
  if (Array.isArray(refs)) return refs.length === 0;
  return true;
}
