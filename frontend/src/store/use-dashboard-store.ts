import { create } from "zustand";

import type { DashboardProject } from "@/lib/types";

interface DashboardState {
  projects: DashboardProject[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

const mockProjects: DashboardProject[] = [
  {
    id: "a1111111-1111-4111-8111-111111111101",
    name: "Диагностика Alpha Ltd",
    clientName: "ООО «Альфа»",
    status: "active",
    currentStage: "analysis",
    iqdAggregate: 0.72,
    artifacts: [
      {
        id: "art-1",
        type: "questionnaire",
        title: "Опрос руководителей (v2)",
        version: 2,
      },
      {
        id: "art-2",
        type: "stakeholder_map",
        title: "Карта стейкхолдеров",
        version: 1,
      },
    ],
    hypotheses: [
      {
        id: "hyp-1",
        text: "Разрыв между заявленной стратегией и операционными решениями.",
        confidenceLevel: "B",
        confidenceScore: 0.62,
        unverified: false,
      },
      {
        id: "hyp-2",
        text: "Низкая горизонтальная координация между подразделениями.",
        confidenceLevel: "C",
        confidenceScore: 0.41,
        unverified: true,
      },
      {
        id: "hyp-3",
        text: "Искажения при сборе обратной связи (социально желательные ответы).",
        confidenceLevel: "B",
        confidenceScore: 0.58,
        unverified: false,
      },
    ],
  },
  {
    id: "b2222222-2222-4222-8222-222222222202",
    name: "Оргразвитие Beta",
    clientName: "АО «Бета»",
    status: "draft",
    currentStage: "intake",
    iqdAggregate: 0.0,
    artifacts: [],
    hypotheses: [],
  },
];

export const useDashboardStore = create<DashboardState>((set) => ({
  projects: mockProjects,
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
}));
