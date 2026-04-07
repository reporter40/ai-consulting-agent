"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError, fetchJson } from "@/lib/api";
import { formatApiError, useProjects } from "@/hooks/use-projects";
import type { ProjectRead } from "@/lib/api-types";
import { STAGE_LABELS } from "@/lib/stage-labels";
import { normalizeStage } from "@/lib/stage-utils";
import { cn } from "@/lib/utils";
import type { DashboardProject } from "@/lib/types";
import { useDashboardStore } from "@/store/use-dashboard-store";

const statusLabel: Record<string, string> = {
  draft: "Черновик",
  active: "Активен",
  paused: "Пауза",
  completed: "Завершён",
};

function normalizeRows(
  api: ProjectRead[],
  mock: DashboardProject[],
  useMock: boolean,
): { id: string; name: string; client: string; status: string; stageKey: string }[] {
  if (useMock && mock.length > 0) {
    return mock.map((p) => ({
      id: p.id,
      name: p.name,
      client: p.clientName,
      status: p.status,
      stageKey: p.currentStage,
    }));
  }
  return api.map((p) => ({
    id: p.id,
    name: p.name,
    client: p.client_name,
    status: p.status,
    stageKey: p.current_stage,
  }));
}

export default function DashboardPage() {
  const router = useRouter();
  const { projects, loading, error, refetch } = useProjects();
  const mockProjects = useDashboardStore((s) => s.projects);
  const showMockFallback = Boolean(error) && mockProjects.length > 0;
  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const rows = useMemo(
    () => normalizeRows(projects, mockProjects, showMockFallback),
    [projects, mockProjects, showMockFallback],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const client = newClient.trim();
    if (!name || !client || creating) return;
    setCreating(true);
    setCreateErr(null);
    try {
      const p = await fetchJson<ProjectRead>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name, client_name: client }),
      });
      setNewName("");
      setNewClient("");
      await refetch();
      router.push(`/dashboard/${p.id}`);
    } catch (err) {
      setCreateErr(
        err instanceof ApiError ? `${err.status}: ${err.message}` : String(err),
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Проекты</h1>
        <p className="text-muted-foreground text-sm">
          Данные с бэкенда <code className="text-xs">GET /api/projects</code>
          {showMockFallback && " — показан fallback на mock (Zustand)."}
        </p>
      </div>

      {!showMockFallback && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Новый проект</CardTitle>
            <CardDescription>
              Создайте карточку в базе и откройте дашборд диагностики.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
            >
              <div className="grid min-w-0 flex-1 gap-2 sm:max-w-xs">
                <label htmlFor="np-name" className="text-sm font-medium">
                  Название
                </label>
                <input
                  id="np-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Напр. Диагностика Q2"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  disabled={creating}
                />
              </div>
              <div className="grid min-w-0 flex-1 gap-2 sm:max-w-xs">
                <label htmlFor="np-client" className="text-sm font-medium">
                  Клиент
                </label>
                <input
                  id="np-client"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="Название компании"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  disabled={creating}
                />
              </div>
              <button
                type="submit"
                disabled={
                  creating || !newName.trim() || !newClient.trim()
                }
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "sm:shrink-0",
                )}
              >
                {creating ? "Создание…" : "Создать и открыть"}
              </button>
            </form>
            {createErr && (
              <p className="text-destructive mt-2 text-sm">{createErr}</p>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="py-3">
            <CardTitle className="text-base text-destructive">
              Не удалось загрузить API
            </CardTitle>
            <CardDescription>{formatApiError(error)}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-0">
            <button
              type="button"
              onClick={() => refetch()}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Повторить
            </button>
          </CardContent>
        </Card>
      )}

      {loading && !error && (
        <p className="text-muted-foreground text-sm">Загрузка…</p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Проектов нет. Запустите backend и миграции; при пустой БД выполнится демо-seed
          при старте Docker или вручную:{" "}
          <code className="text-xs">python -m app.seed</code>.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((p) => {
          const stage = normalizeStage(p.stageKey);
          return (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug">{p.name}</CardTitle>
                  <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </div>
                <CardDescription>Клиент: {p.client}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-3">
                <p className="text-muted-foreground text-sm">
                  Стадия:{" "}
                  <span className="text-foreground font-medium">
                    {STAGE_LABELS[stage]}
                  </span>
                </p>
                <Link
                  href={`/dashboard/${p.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-fit",
                  )}
                >
                  Открыть карточку
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
