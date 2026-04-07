import type { DiagnosticStage } from "@/lib/types";

export const STAGE_ORDER: DiagnosticStage[] = [
  "intake",
  "data_collection",
  "analysis",
  "hypothesis_synthesis",
  "report_review",
  "completed",
];

export const STAGE_LABELS: Record<DiagnosticStage, string> = {
  intake: "Ввод / intake",
  data_collection: "Сбор данных",
  analysis: "Анализ",
  hypothesis_synthesis: "Гипотезы",
  report_review: "Отчёт",
  completed: "Завершено",
};
