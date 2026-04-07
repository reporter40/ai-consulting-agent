"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchJson } from "@/lib/api";
import type { HypothesisRead } from "@/lib/api-types";
import { hypothesisIsUnverified } from "@/lib/hypothesis-utils";

function statusRu(s: string): string {
  switch (s) {
    case "validated":
      return "Проверена по графу";
    case "selected":
      return "Выбрана";
    case "rejected":
      return "Отклонена";
    default:
      return "Сгенерирована";
  }
}

export function HypothesisPanel({
  projectId,
  hypotheses,
  onUpdated,
}: {
  projectId: string;
  hypotheses: HypothesisRead[];
  onUpdated: () => void;
}) {
  const [ctx, setCtx] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [llmOk, setLlmOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/settings/llm")
      .then((r) => r.json())
      .then((d: { llm_configured?: boolean }) =>
        setLlmOk(Boolean(d.llm_configured)),
      )
      .catch(() => setLlmOk(null));
  }, []);

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setErr(null);
      setBusy(true);
      try {
        await fn();
        onUpdated();
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [onUpdated],
  );

  const generate = () =>
    run(async () => {
      await fetchJson<HypothesisRead[]>(
        `/api/projects/${projectId}/hypotheses/generate`,
        {
          method: "POST",
          body: JSON.stringify({ context_summary: ctx }),
        },
      );
    });

  const verifyAll = () =>
    run(async () => {
      const res = await fetch(
        `/api/projects/${projectId}/hypotheses/verify-all`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(await res.text());
      await res.json();
    });

  const verifyOne = (id: string) =>
    run(async () => {
      await fetchJson<HypothesisRead>(
        `/api/projects/${projectId}/hypotheses/verify`,
        {
          method: "POST",
          body: JSON.stringify({ hypothesis_id: id }),
        },
      );
    });

  const selectOne = (id: string) =>
    run(async () => {
      await fetchJson<HypothesisRead>(
        `/api/projects/${projectId}/hypotheses/select`,
        {
          method: "POST",
          body: JSON.stringify({ hypothesis_id: id }),
        },
      );
    });

  return (
    <div className="space-y-4">
      {llmOk === false && (
        <p className="text-muted-foreground text-sm">
          LLM не настроен — генерация даст три офлайн-гипотезы. Ключи:{" "}
          <a className="underline" href="/dashboard/settings">
            Настройки LLM
          </a>
          .
        </p>
      )}
      {err && (
        <p className="text-destructive text-sm whitespace-pre-wrap">{err}</p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Генерация</CardTitle>
          <CardDescription>
            Контекст (обезличенный фрагмент) для трёх конкурирующих гипотез.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            value={ctx}
            onChange={(e) => setCtx(e.target.value)}
            placeholder="Краткий контекст для модели…"
            rows={3}
            disabled={busy}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[72px] flex-1 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy} onClick={() => void generate()}>
              Сгенерировать
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || hypotheses.length === 0}
              onClick={() => void verifyAll()}
            >
              Проверить все по графу
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {hypotheses.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Гипотезы ещё не созданы — нажмите «Сгенерировать».
          </p>
        )}
        {hypotheses.map((h) => {
          const unv = hypothesisIsUnverified(h);
          return (
            <div
              key={h.id}
              className="bg-card/50 border-border rounded-lg border p-4 text-sm"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Уровень {h.confidence_level}</Badge>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(h.confidence_score * 100)}%
                </span>
                <Badge variant="secondary">{statusRu(h.status)}</Badge>
                {unv && (
                  <Badge variant="destructive" className="font-mono text-xs">
                    [UNVERIFIED]
                  </Badge>
                )}
              </div>
              <p className="mb-3">{h.text}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void verifyOne(h.id)}
                >
                  Проверить по графу
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void selectOne(h.id)}
                >
                  Выбрать как основную
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
