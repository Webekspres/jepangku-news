"use client";

import { cn } from "@/lib/utils";
import type { AnalyticsPeriod } from "@/lib/analytics";

const OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "7 Hari" },
  { value: "30d", label: "30 Hari" },
  { value: "90d", label: "90 Hari" },
  { value: "all", label: "Semua" },
];

export default function PeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="period-selector" role="group" aria-label="Periode">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-colors",
            value === o.value
              ? "border-foreground bg-foreground text-white"
              : "border-jepang-border text-jepang-muted hover:border-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
