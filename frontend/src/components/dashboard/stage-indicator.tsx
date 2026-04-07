"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stage-labels";
import type { DiagnosticStage } from "@/lib/types";

interface StageIndicatorProps {
  currentStage: DiagnosticStage;
  className?: string;
}

export function StageIndicator({ currentStage, className }: StageIndicatorProps) {
  const idx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {STAGE_ORDER.map((stage, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <Badge
            key={stage}
            variant={active ? "default" : done ? "secondary" : "outline"}
            className="gap-1 pr-2"
          >
            {done && <Check className="size-3.5 opacity-80" aria-hidden />}
            <span className="max-w-[10rem] truncate">{STAGE_LABELS[stage]}</span>
          </Badge>
        );
      })}
    </div>
  );
}
