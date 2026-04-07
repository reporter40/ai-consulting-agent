"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError, fetchJson } from "@/lib/api";
import type { ProjectListResponse, ProjectRead } from "@/lib/api-types";

export interface UseProjectsResult {
  projects: ProjectRead[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchJson<ProjectListResponse>("/api/projects")
      .then((data) => {
        setProjects(data.items);
        setTotal(data.total);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setProjects([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { projects, total, loading, error, refetch: load };
}

export function formatApiError(err: Error | null): string {
  if (!err) return "";
  if (err instanceof ApiError) return `API ${err.status}: ${err.message}`;
  return err.message;
}
