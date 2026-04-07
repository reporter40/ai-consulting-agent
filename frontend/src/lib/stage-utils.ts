import { STAGE_ORDER } from "@/lib/stage-labels";
import type { DiagnosticStage } from "@/lib/types";

export function normalizeStage(raw: string): DiagnosticStage {
  if (STAGE_ORDER.includes(raw as DiagnosticStage)) {
    return raw as DiagnosticStage;
  }
  return "intake";
}
