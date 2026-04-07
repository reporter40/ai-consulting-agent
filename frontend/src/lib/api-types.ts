/** Types aligned with FastAPI response models (subset for UI). */

export type ProjectStatusApi = "draft" | "active" | "paused" | "completed";

export interface ProjectRead {
  id: string;
  name: string;
  client_name: string;
  status: ProjectStatusApi;
  current_stage: string;
  created_at: string;
  updated_at: string;
  consultant_id: string | null;
}

export interface ProjectListResponse {
  items: ProjectRead[];
  total: number;
}

export interface WorkflowStateResponse {
  project_id: string;
  current_stage: string;
  allowed_next: string[];
  awaiting_human: boolean;
  human_checkpoint: string | null;
  hitl: Record<string, boolean>;
}

export type HypothesisStatusApi =
  | "generated"
  | "validated"
  | "rejected"
  | "selected";

export interface HypothesisRead {
  id: string;
  project_id: string;
  text: string;
  confidence_score: number;
  confidence_level: string;
  evidence: unknown;
  sources: unknown;
  status: HypothesisStatusApi;
  created_at: string;
}

export interface IqdResponse {
  project_id: string;
  average_iqd: number | null;
  needs_more_data: boolean;
  stage_scores: { stage: string; iqd: number | null }[];
  questionnaire_scores: { id: string; iqd: number | null }[];
}

export type ArtifactTypeApi =
  | "questionnaire"
  | "hypothesis"
  | "report"
  | "stakeholder_map";

export interface ArtifactRead {
  id: string;
  project_id: string;
  stage_id: string | null;
  type: ArtifactTypeApi;
  content: Record<string, unknown>;
  version: number;
  created_at: string;
}
