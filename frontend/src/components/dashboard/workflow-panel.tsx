"use client";

import { useCallback, useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchJson } from "@/lib/api";
import type { WorkflowStateResponse } from "@/lib/api-types";
import { STAGE_LABELS } from "@/lib/stage-labels";
import { normalizeStage } from "@/lib/stage-utils";
import { cn } from "@/lib/utils";

interface WorkflowPanelProps {
  projectId: string;
  initial: WorkflowStateResponse | null;
  onUpdated: () => void;
}

export function WorkflowPanel({ projectId, initial, onUpdated }: WorkflowPanelProps) {
  const [wf, setWf] = useState<WorkflowStateResponse | null>(initial);
  const [events, setEvents] = useState<unknown[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const ev = await fetchJson<unknown[]>(
        `/api/projects/${projectId}/workflow/events?limit=20`,
      );
      setEvents(ev);
    } catch {
      setEvents([]);
    }
  }, [projectId]);

  useEffect(() => {
    setWf(initial);
  }, [initial]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents, initial]);

  const refresh = useCallback(async () => {
    try {
      const w = await fetchJson<WorkflowStateResponse>(
        `/api/projects/${projectId}/workflow`,
      );
      setWf(w);
      setMsg(null);
      onUpdated();
      await loadEvents();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Ошибка");
    }
  }, [projectId, onUpdated, loadEvents]);

  const nextStage = wf?.allowed_next?.[0];
  const nextLabel = nextStage
    ? STAGE_LABELS[normalizeStage(nextStage)]
    : null;

  const doAdvance = async () => {
    if (!nextStage) return;
    setBusy(true);
    setMsg(null);
    try {
      const w = await fetchJson<WorkflowStateResponse>(
        `/api/projects/${projectId}/workflow/advance`,
        {
          method: "POST",
          body: JSON.stringify({ target_stage: nextStage }),
        },
      );
      setWf(w);
      onUpdated();
      await loadEvents();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Ошибка перехода");
    } finally {
      setBusy(false);
    }
  };

  const doConfirm = async () => {
    const cp = wf?.human_checkpoint;
    if (!cp) return;
    setBusy(true);
    setMsg(null);
    try {
      const w = await fetchJson<WorkflowStateResponse>(
        `/api/projects/${projectId}/workflow/confirm`,
        {
          method: "POST",
          body: JSON.stringify({ checkpoint: cp, approved: true }),
        },
      );
      setWf(w);
      onUpdated();
      await loadEvents();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Ошибка подтверждения");
    } finally {
      setBusy(false);
    }
  };

  if (!wf) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workflow (state machine)</CardTitle>
        <CardDescription>
          Следующий шаг без пропусков. HITL: подтверждение перед переходом с
          «Гипотезы» и «Отчёт».
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
          <span>
            HITL: method_selection={String(wf.hitl?.method_selection ?? false)}, final_report=
            {String(wf.hitl?.final_report ?? false)}
          </span>
        </div>
        {wf.awaiting_human && wf.human_checkpoint && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Ожидается подтверждение: {wf.human_checkpoint}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => doConfirm()}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Подтвердить
            </button>
          </div>
        )}
        {nextStage && nextLabel && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => doAdvance()}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Продвинуть → {nextLabel}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => refresh()}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Обновить
            </button>
          </div>
        )}
        {msg && <p className="text-destructive text-sm">{msg}</p>}
        {events.length > 0 && (
          <div className="border-border rounded-md border p-2 text-xs">
            <p className="text-muted-foreground mb-1 font-medium">События (Redis)</p>
            <ul className="max-h-32 space-y-1 overflow-y-auto font-mono">
              {events.slice(0, 15).map((ev, i) => (
                <li key={i}>{JSON.stringify(ev)}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
