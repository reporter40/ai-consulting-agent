import Link from "next/link";

import { KgStatusBar } from "@/components/dashboard/kg-status";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 py-4">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
                AI Consulting Agent
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              >
                Настройки LLM
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              Дашборд консультанта (прототип)
            </p>
          </div>
          <KgStatusBar />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
