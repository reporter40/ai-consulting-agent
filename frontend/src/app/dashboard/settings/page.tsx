"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LlmSettingsPublic } from "@/lib/llm-settings-types";
import { cn } from "@/lib/utils";

const TOKEN_KEY = "aca_settings_token";

export default function DashboardSettingsPage() {
  const [info, setInfo] = useState<LlmSettingsPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const [settingsToken, setSettingsToken] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [abacusKey, setAbacusKey] = useState("");
  const [abacusBaseUrl, setAbacusBaseUrl] = useState("");
  const [llmModel, setLlmModel] = useState("");
  const [clearAnthropic, setClearAnthropic] = useState(false);
  const [clearAbacus, setClearAbacus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/llm");
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as LlmSettingsPublic;
      setInfo(data);
      setAbacusBaseUrl(data.abacus_base_url);
      setLlmModel(data.llm_model);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) setSettingsToken(t);
  }, []);

  const persistToken = (token: string) => {
    if (typeof window === "undefined") return;
    if (token.trim()) sessionStorage.setItem(TOKEN_KEY, token.trim());
    else sessionStorage.removeItem(TOKEN_KEY);
  };

  const onSave = async () => {
    setSaveOk(null);
    setError(null);
    if (!info?.settings_write_enabled) {
      setError("На сервере не задан SETTINGS_SECRET — см. подсказку ниже.");
      return;
    }
    const tok = settingsToken.trim();
    if (!tok) {
      setError("Введите токен настроек (SETTINGS_SECRET).");
      return;
    }
    persistToken(tok);

    const body: Record<string, string> = {};
    if (clearAnthropic) body.anthropic_api_key = "";
    else if (anthropicKey.trim()) body.anthropic_api_key = anthropicKey.trim();

    if (clearAbacus) body.abacus_api_key = "";
    else if (abacusKey.trim()) body.abacus_api_key = abacusKey.trim();

    body.abacus_base_url = abacusBaseUrl.trim();
    body.llm_model = llmModel.trim();

    setSaving(true);
    try {
      const res = await fetch("/api/settings/llm", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Settings-Token": tok,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as LlmSettingsPublic;
      setInfo(data);
      setAnthropicKey("");
      setAbacusKey("");
      setClearAnthropic(false);
      setClearAbacus(false);
      setSaveOk("Сохранено в backend/data/llm_secrets.json");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Настройки LLM
        </h1>
        <p className="text-muted-foreground text-sm">
          Работа без ключей возможна (офлайн-режим). Ключи сохраняются в файл на
          сервере и не попадают в git.
        </p>
      </div>

      {loading && (
        <p className="text-muted-foreground text-sm">Загрузка…</p>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="py-3">
            <CardTitle className="text-destructive text-base">Ошибка</CardTitle>
            <CardDescription className="text-destructive/90">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {saveOk && (
        <p className="text-muted-foreground text-sm">{saveOk}</p>
      )}

      {info && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Текущее состояние</CardTitle>
            <CardDescription>
              Backend: {info.llm_backend} · LLM включён:{" "}
              {info.llm_configured ? "да" : "нет"} · Запись из UI:{" "}
              {info.settings_write_enabled ? "да" : "нет"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm">
            <p>Anthropic ключ: {info.anthropic_key_set ? "задан" : "нет"}</p>
            <p>Abacus ключ: {info.abacus_key_set ? "задан" : "нет"}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Секреты и модель</CardTitle>
          <CardDescription>
            В <code className="text-xs">backend/.env</code> задайте{" "}
            <code className="text-xs">SETTINGS_SECRET</code> (например{" "}
            <code className="text-xs">openssl rand -hex 16</code>) и вставьте
            тот же текст ниже. Без этого сохранение отключено.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="settok" className="text-sm font-medium">
              Токен настроек (SETTINGS_SECRET)
            </label>
            <input
              id="settok"
              type="password"
              autoComplete="off"
              value={settingsToken}
              onChange={(e) => setSettingsToken(e.target.value)}
              placeholder="Секрет из backend/.env"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-md rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ak" className="text-sm font-medium">
              Anthropic API key
            </label>
            <input
              id="ak"
              type="password"
              autoComplete="off"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="Новый ключ или пусто — не менять"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-lg rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clearAnthropic}
                onChange={(e) => setClearAnthropic(e.target.checked)}
              />
              Удалить сохранённый ключ Anthropic из файла
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="bk" className="text-sm font-medium">
              Abacus API key
            </label>
            <input
              id="bk"
              type="password"
              autoComplete="off"
              value={abacusKey}
              onChange={(e) => setAbacusKey(e.target.value)}
              placeholder="Новый ключ или пусто — не менять"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-lg rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={clearAbacus}
                onChange={(e) => setClearAbacus(e.target.checked)}
              />
              Удалить сохранённый ключ Abacus из файла
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="base" className="text-sm font-medium">
              Abacus base URL
            </label>
            <input
              id="base"
              type="url"
              value={abacusBaseUrl}
              onChange={(e) => setAbacusBaseUrl(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full max-w-lg rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="model" className="text-sm font-medium">
              LLM_MODEL
            </label>
            <input
              id="model"
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              placeholder="Имя модели для выбранного провайдера"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-lg rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          <Button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || !info?.settings_write_enabled}
          >
            {saving ? "Сохранение…" : "Сохранить в llm_secrets.json"}
          </Button>
          {!info?.settings_write_enabled && info && (
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              Задайте SETTINGS_SECRET в backend/.env и перезапустите API — тогда
              кнопка станет активной.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
