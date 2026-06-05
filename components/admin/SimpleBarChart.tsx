"use client";

import { cn } from "@/lib/utils";

export type BarDatum = { label: string; value: number; subLabel?: string };

export default function SimpleBarChart({
  data,
  valueLabel = "Jumlah",
  className,
}: {
  data: BarDatum[];
  valueLabel?: string;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <p className="text-sm text-jepang-muted py-8 text-center" data-testid="bar-chart-empty">
        Belum ada data untuk ditampilkan.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)} data-testid="simple-bar-chart">
      <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted">{valueLabel}</p>
      {data.map((d) => (
        <div key={d.label} className="grid grid-cols-[88px_1fr_48px] items-center gap-3 text-sm">
          <span className="font-mono text-[11px] text-jepang-muted truncate" title={d.label}>
            {d.label}
          </span>
          <div className="h-3 bg-jepang-border">
            <div
              className="h-full bg-jepang-red transition-all"
              style={{ width: `${Math.round((d.value / max) * 100)}%` }}
            />
          </div>
          <span className="font-mono font-bold text-right tabular-nums">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
