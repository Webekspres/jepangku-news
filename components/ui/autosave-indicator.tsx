"use client";

import { CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { AutosaveStatus } from "@/hooks/useAutosave";
import { cn } from "@/lib/utils";

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;

  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function AutosaveIndicator({
  status,
  lastSavedAt,
  className,
}: AutosaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs tabular-nums transition-opacity duration-300",
        className,
      )}
      aria-live="polite"
    >
      {status === "pending" && (
        <>
          <Clock size={12} className="text-jepang-muted shrink-0" />
          <span className="text-jepang-muted">Mengetik…</span>
        </>
      )}

      {status === "saving" && (
        <>
          <Loader2
            size={12}
            className="text-jepang-muted shrink-0 animate-spin"
          />
          <span className="text-jepang-muted">Menyimpan draft…</span>
        </>
      )}

      {status === "saved" && (
        <>
          <CheckCircle2 size={12} className="text-green-600 shrink-0" />
          <span className="text-green-700">
            Tersimpan otomatis
            {lastSavedAt && (
              <> &middot; {formatRelativeTime(lastSavedAt)}</>
            )}
          </span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle size={12} className="text-jepang-red shrink-0" />
          <span className="text-jepang-red">Gagal menyimpan otomatis</span>
        </>
      )}
    </span>
  );
}
