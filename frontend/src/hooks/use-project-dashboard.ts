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
      fetchJson<WorkflowStateResponse>(`${base}/workflow`).catch(() => null),
      fetchJson<HypothesisRead[]>(`${base}/hypotheses`).catch(() => []),
      fetchJson<IqdResponse>(`${base}/iqd`).catch(() => null),
      fetchJson<ArtifactRead[]>(`${base}/artifacts`).catch(() => []),
    ])
      .then(([project, workflow, hypotheses, iqd, artifacts]) => {
        setData({
          project,
          workflow,
          hypotheses,
          iqd,
          artifacts,
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
