"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { DiagnosticChat } from "@/components/dashboard/diagnostic-chat";
import { HypothesisPanel } from "@/components/dashboard/hypothesis-panel";
import { StageIndicator } from "@/components/dashboard/stage-indicator";
import { WorkflowPanel } from "@/components/dashboard/workflow-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectDashboard } from "@/hooks/use-project-dashboard";
import { formatApiError } from "@/hooks/use-projects";
import type { ArtifactRead, HypothesisRead } from "@/lib/api-types";
import { hypothesisIsUnverified } from "@/lib/hypothesis-utils";
import { STAGE_LABELS } from "@/lib/stage-labels";
import { normalizeStage } from "@/lib/stage-utils";
import { cn } from "@/lib/utils";
import type { DiagnosticStage } from "@/lib/types";
import { useDashboardStore } from "@/store/use-dashboard-store";

const artifactTypeLabel: Record<string, string> = {
  questionnaire: "Опросник",
  hypothesis: "Гипотеза",
  report: "Отчёт",
  stakeholder_map: "Стейкхолдеры",
};

function artifactTitle(a: ArtifactRead): string {
  const t = a.content?.title;
  if (typeof t === "string" && t.length > 0) return t;
  return artifactTypeLabel[a.type] ?? a.type;
}

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const { data, loading, error, refetch } = useProjectDashboard(projectId);
  const mockProjects = useDashboardStore((s) => s.projects);
  const mockProject = mockProjects.find((p) => p.id === projectId);

  const useMock = Boolean(error && mockProject);
  const view = useMemo(() => {
    if (useMock && mockProject) {
      return {
        title: mockProject.name,
        client: mockProject.clientName,
        stage: mockProject.currentStage as DiagnosticStage,
        iqd: mockProject.iqdAggregate,
        artifacts: mockProject.artifacts.map((a) => ({
          id: a.id,
          title: a.title,
          typeLabel: artifactTypeLabel[a.type] ?? a.type,
          version: a.version,
        })),
        hypotheses: mockProject.hypotheses.map((h) => ({
          id: h.id,
          text: h.text,
          level: h.confidenceLevel,
          score: h.confidenceScore,
          unverified: h.unverified,
        })),
        source: "mock" as const,
      };
    }
    const p = data.project;
    const wf = data.workflow;
    const stageRaw = wf?.current_stage ?? p?.current_stage ?? "intake";
    const stage = normalizeStage(stageRaw) as DiagnosticStage;
    const iqdVal = data.iqd?.average_iqd ?? null;
    return {
      title: p?.name ?? "Проект",
      client: p?.client_name ?? "—",
      stage,
      iqd: iqdVal ?? 0,
      artifacts: data.artifacts.map((a) => ({
        id: a.id,
        title: artifactTitle(a),
        typeLabel: artifactTypeLabel[a.type] ?? a.type,
        version: a.version,
      })),
      hypotheses: data.hypotheses.map((h) => ({
        id: h.id,
        text: h.text,
        level: h.confidence_level,
        score: h.confidence_score,
        unverified: hypothesisIsUnverified(h),
      })),
      source: "api" as const,
    };
  }, [data, mockProject, useMock]);

  if (!projectId) {
    return (
      <p className="text-muted-foreground text-sm">Некорректный адрес.</p>
    );
  }

  if (loading && !useMock) {
    return (
      <p className="text-muted-foreground text-sm">Загрузка карточки…</p>
    );
  }

  if (!loading && !useMock && !data.project) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive text-base">
              Проект не загружен
            </CardTitle>
            <CardDescription>
              {error
                ? formatApiError(error)
                : "Проверьте id в адресе и что backend доступен (GET /api/projects/{id})."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Повторить
            </button>
            {mockProject && (
              <p className="text-muted-foreground w-full text-sm">
                Есть mock-карточка для этого id — перезагрузите список или
                включите fallback (ошибка на списке).
              </p>
            )}
          </CardContent>
        </Card>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          К списку проектов
        </Link>
      </div>
    );
  }

  const iqdPct = Math.round(view.iqd * 100);
  const iqdLow = view.iqd > 0 && view.iqd < 0.6;

  return (
    <div className="space-y-8">
      {error && useMock && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="py-3">
            <CardTitle className="text-base">Режим mock</CardTitle>
            <CardDescription>
              API недоступен — показаны данные из Zustand для демонстрации UI.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 mb-1 inline-flex",
            )}
          >
            ← Проекты
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{view.title}</h1>
          <p className="text-muted-foreground text-sm">Клиент: {view.client}</p>
          {!loading && view.source === "api" && (
            <p className="text-muted-foreground mt-1 text-xs">
              Источник: API · workflow + гипотезы + IQD + артефакты
            </p>
          )}
        </div>
        <Badge variant="outline">
          Текущая стадия: {STAGE_LABELS[view.stage]}
        </Badge>
      </div>

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
          Диагностика (state machine)
        </h2>
        <StageIndicator currentStage={view.stage} />
      </section>

      {view.source === "api" && data.workflow && projectId && (
        <WorkflowPanel
          projectId={projectId}
          initial={{
            ...data.workflow,
            hitl: data.workflow.hitl ?? {},
          }}
          onUpdated={() => refetch()}
        />
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="artifacts">Артефакты</TabsTrigger>
          <TabsTrigger value="hypotheses">Гипотезы</TabsTrigger>
          <TabsTrigger value="report">Отчёт</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">IQD (индекс качества данных)</CardTitle>
              <CardDescription>
                Среднее по этапам/опросникам из API, 0–1. Порог &lt; 60% — запрос
                дополнительных данных.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums">
                  {view.source === "api" && data.iqd?.average_iqd == null
                    ? "—"
                    : `${iqdPct}%`}
                </span>
                {view.iqd === 0 && view.source === "mock" && (
                  <span className="text-muted-foreground text-sm">
                    ещё не оценено (mock)
                  </span>
                )}
              </div>
              {iqdLow && (
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  Ниже порога — рекомендуется расширить выборку или уточнить
                  вопросы.
                </p>
              )}
            </CardContent>
          </Card>

          {view.source === "api" && projectId && (
            <DiagnosticChat projectId={projectId} />
          )}
        </TabsContent>

        <TabsContent value="artifacts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Артефакты</CardTitle>
              <CardDescription>
                {view.source === "api"
                  ? "Из PostgreSQL через API."
                  : "Mock — позже только API."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {view.artifacts.length === 0 && (
                <p className="text-muted-foreground text-sm">Пока нет артефактов.</p>
              )}
              {view.artifacts.map((a) => (
                <div key={a.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{a.title}</span>
                    <Badge variant="secondary">
                      {a.typeLabel} · v{a.version}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hypotheses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Конкурирующие гипотезы</CardTitle>
              <CardDescription>
                Утверждения без graph_refs в Neo4j помечаются как [UNVERIFIED].
                Проверка по графу — через Neo4j; выбор основной гипотезы для отчёта.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {view.source === "api" && projectId ? (
                <HypothesisPanel
                  projectId={projectId}
                  hypotheses={data.hypotheses as HypothesisRead[]}
                  onUpdated={() => refetch()}
                />
              ) : (
                <div className="space-y-4">
                  {view.hypotheses.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Гипотезы ещё не сгенерированы.
                    </p>
                  )}
                  {view.hypotheses.map((h) => (
                    <div
                      key={h.id}
                      className="bg-card/50 border-border rounded-lg border p-4 text-sm"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Уровень {h.level}</Badge>
                        <span className="text-muted-foreground tabular-nums">
                          {Math.round(h.score * 100)}%
                        </span>
                        {h.unverified && (
                          <Badge variant="destructive" className="font-mono text-xs">
                            [UNVERIFIED]
                          </Badge>
                        )}
                      </div>
                      <p>{h.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">PDF-отчёт</CardTitle>
              <CardDescription>
                Сводка по проекту: IQD, таблица гипотез, дисклеймер. Файл также
                фиксируется как артефакт типа «Отчёт».
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {view.source === "api" && projectId ? (
                <a
                  href={`/api/projects/${projectId}/report/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "default" }))}
                >
                  Скачать PDF
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Доступно при подключении API.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
