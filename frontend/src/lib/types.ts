export type ProjectStatus = "draft" | "active" | "paused" | "completed";

/** Must match backend `STAGE_ORDER` */
export type DiagnosticStage =
  | "intake"
  | "data_collection"
  | "analysis"
  | "hypothesis_synthesis"
  | "report_review"
  | "completed";

export interface MockArtifact {
  id: string;
  type: "questionnaire" | "hypothesis" | "report" | "stakeholder_map";
  title: string;
  version: number;
}

export interface MockHypothesis {
  id: string;
  text: string;
  confidenceLevel: "A" | "B" | "C";
  confidenceScore: number;
  unverified: boolean;
}

export interface DashboardProject {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  currentStage: DiagnosticStage;
  iqdAggregate: number;
  artifacts: MockArtifact[];
  hypotheses: MockHypothesis[];
}
