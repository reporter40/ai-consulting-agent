"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StreamMode = "analytic" | "questionnaire";

type SsePayload =
  | {
      type: "meta";
      mode: string;
      temperature: number;
      llm_enabled: boolean;
      llm_backend?: string;
      attachments_count?: number;
    }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

function parseSseBuffer(buffer: string): { events: SsePayload[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: SsePayload[] = [];
  for (const block of parts) {
    const line = block.trim();
    if (!line.startsWith("data: ")) continue;
    try {
      events.push(JSON.parse(line.slice(6)) as SsePayload);
    } catch {
      /* ignore malformed chunk */
    }
  }
  return { events, rest };
}

export function DiagnosticChat({
  projectId,
  className,
}: {
  projectId: string;
  className?: string;
}) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<StreamMode>("analytic");
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runStream = useCallback(async () => {
    const text = message.trim();
    if (loading) return;
    if (!text && files.length === 0) return;
    setLoading(true);
    setError(null);
    setOutput("");
    setMeta(null);

    try {
      const hasFiles = files.length > 0;
      const res = await fetch(
        `/api/projects/${projectId}/diagnostic/stream`,
        hasFiles
          ? {
              method: "POST",
              body: (() => {
                const fd = new FormData();
                fd.append("message", text);
                fd.append("mode", mode);
                for (const f of files) {
                  fd.append("files", f);
                }
                return fd;
              })(),
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: text || "Проанализируй приложенные материалы полевых исследований.",
                mode,
                attachments: [],
              }),
            },
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || res.statusText);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Нет тела ответа");
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const { events, rest } = parseSseBuffer(buf);
        buf = rest;
        for (const ev of events) {
          if (ev.type === "meta") {
            const back = ev.llm_backend ? `, backend: ${ev.llm_backend}` : "";
            const att =
              typeof ev.attachments_count === "number" && ev.attachments_count > 0
                ? `, файлов: ${ev.attachments_count}`
                : "";
            setMeta(
              `Режим: ${ev.mode}, t=${ev.temperature}, LLM: ${ev.llm_enabled ? "да" : "нет"}${back}${att}`,
            );
          } else if (ev.type === "token") {
            acc += ev.text;
            setOutput(acc);
          } else if (ev.type === "error") {
            setError(ev.message);
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [message, mode, projectId, loading, files]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">Диагностический чат (SSE)</CardTitle>
        <CardDescription>
          Текст запроса и при необходимости файлы полевых исследований (.txt, .md,
          .csv, .json, .pdf, .docx до ~8 МБ). Отправка с файлами идёт как multipart.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="diag-mode" className="text-sm font-medium">
            Режим
          </label>
          <select
            id="diag-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as StreamMode)}
            disabled={loading}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full max-w-xs rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="analytic">Аналитика (t≈0.3)</option>
            <option value="questionnaire">Опросник (t≈0.7)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="diag-msg" className="text-sm font-medium">
            Запрос консультанта
          </label>
          <textarea
            id="diag-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Контекст и вопрос. Можно оставить пустым, если загружены только материалы полевых исследований."
            rows={4}
            disabled={loading}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="diag-files" className="text-sm font-medium">
            Полевые материалы (опционально)
          </label>
          <input
            id="diag-files"
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.pdf,.docx,text/plain,text/csv,application/json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={loading}
            onChange={(e) => {
              const list = e.target.files;
              setFiles(list ? Array.from(list) : []);
            }}
            className="text-muted-foreground text-sm file:mr-3 file:rounded-md file:border file:bg-muted file:px-2 file:py-1 file:text-sm"
          />
          {files.length > 0 && (
            <p className="text-muted-foreground text-xs">
              Выбрано файлов: {files.length}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={runStream}
          disabled={
            loading || (!message.trim() && files.length === 0)
          }
        >
          {loading ? "Поток…" : "Отправить"}
        </Button>
        {meta && (
          <p className="text-muted-foreground text-xs">{meta}</p>
        )}
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
        {output && (
          <div className="bg-muted/50 max-h-80 overflow-auto rounded-md border p-3 text-sm whitespace-pre-wrap">
            {output}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
