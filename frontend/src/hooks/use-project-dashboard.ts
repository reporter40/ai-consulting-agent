"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchJson } from "@/lib/api";
import type {
  ArtifactRead,
  HypothesisRead,
  IqdResponse,
  ProjectRead,
  WorkflowStateResponse,
} from "@/lib/api-types";

export interface ProjectDashboardBundle {
  project: ProjectRead | null;
  workflow: WorkflowStateResponse | null;
  hypotheses: HypothesisRead[];
  iqd: IqdResponse | null;
  artifacts: ArtifactRead[];
  errors: {
    workflow: string | null;
    hypotheses: string | null;
    iqd: string | null;
    artifacts: string | null;
  };
}

export interface UseProjectDashboardResult {
  data: ProjectDashboardBundle;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const emptyBundle: ProjectDashboardBundle = {
  project: null,
  workflow: null,
  hypotheses: [],
  iqd: null,
  artifacts: [],
  errors: {
    workflow: null,
    hypotheses: null,
    iqd: null,
    artifacts: null,
  },
};

export function useProjectDashboard(projectId: string | undefined): UseProjectDashboardResult {
  const [data, setData] = useState<ProjectDashboardBundle>(emptyBundle);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    if (!projectId) {
      setData(emptyBundle);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const base = `/api/projects/${projectId}`;

    Promise.all([
      fetchJson<ProjectRead>(base),
      fetchJson<WorkflowStateResponse>(`${base}/workflow`).then(
        (value) => ({ value, error: null }),
        (e: unknown) => ({ value: null, error: e instanceof Error ? e.message : "Ошибка workflow" }),
      ),
      fetchJson<HypothesisRead[]>(`${base}/hypotheses`).then(
        (value) => ({ value, error: null }),
        (e: unknown) => ({ value: [], error: e instanceof Error ? e.message : "Ошибка гипотез" }),
      ),
      fetchJson<IqdResponse>(`${base}/iqd`).then(
        (value) => ({ value, error: null }),
        (e: unknown) => ({ value: null, error: e instanceof Error ? e.message : "Ошибка IQD" }),
      ),
      fetchJson<ArtifactRead[]>(`${base}/artifacts`).then(
        (value) => ({ value, error: null }),
        (e: unknown) => ({ value: [], error: e instanceof Error ? e.message : "Ошибка артефактов" }),
      ),
    ])
      .then(([project, workflow, hypotheses, iqd, artifacts]) => {
        setData({
          project,
          workflow: workflow.value,
          hypotheses: hypotheses.value,
          iqd: iqd.value,
          artifacts: artifacts.value,
          errors: {
            workflow: workflow.error,
            hypotheses: hypotheses.error,
            iqd: iqd.error,
            artifacts: artifacts.error,
          },
        });
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setData(emptyBundle);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
