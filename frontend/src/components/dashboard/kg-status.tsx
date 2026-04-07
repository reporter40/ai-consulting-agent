"use client";

import { useEffect, useState } from "react";

interface KgStatusPayload {
  connected?: boolean;
  meta?: { version?: string; changelog_ref?: string } | null;
  error?: string;
}

export function KgStatusBar() {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/knowledge-graph/status", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          setLine(`Neo4j: ответ ${r.status}`);
          return;
        }
        const d = (await r.json()) as KgStatusPayload;
        if (d.connected && d.meta?.version) {
          setLine(`Neo4j · граф знаний v${d.meta.version}`);
        } else if (d.connected && !d.meta) {
          setLine("Neo4j подключён; метаданные графа не найдены (запустите seed).");
        } else {
          const err = d.error;
          setLine(
            typeof err === "string" && err.length > 0
              ? `Neo4j: недоступен (${err.slice(0, 72)}…)`
              : "Neo4j: нет подключения",
          );
        }
      })
      .catch(() => setLine("Neo4j: ошибка запроса статуса"));
  }, []);

  if (!line) {
    return null;
  }

  return (
    <p className="text-muted-foreground max-w-md text-right text-xs leading-snug">
      {line}
    </p>
  );
}
