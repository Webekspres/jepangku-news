"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CONTENT_REACTIONS, type ContentReactionKey } from "@/lib/reactions-display";
import { cn } from "@/lib/utils";

export type ReactionTargetType = "ARTICLE" | "POLL" | "QUIZ";

type ReactionKey = ContentReactionKey;

type Summary = {
  counts: Record<string, number>;
  total: number;
  userReaction: ReactionKey | null;
};

export default function ReactionBar({
  targetType,
  targetId,
  compact = false,
}: {
  targetType: ReactionTargetType;
  targetId: string;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const authUser = isAuthUser(user) ? user : null;

  const [summary, setSummary] = useState<Summary>({
    counts: {},
    total: 0,
    userReaction: null,
  });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reactions?targetType=${targetType}&targetId=${targetId}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) {
        setSummary({
          counts: data.counts || {},
          total: data.total || 0,
          userReaction: data.userReaction || null,
        });
      }
    } catch {
      // diamkan: bar reaksi tidak boleh memblok halaman
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    load();
  }, [load]);

  const react = async (type: ReactionKey) => {
    if (!authUser) {
      toast.error("Silakan masuk untuk memberi reaksi");
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetType, targetId, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan reaksi");
      setSummary({
        counts: data.counts || {},
        total: data.total || 0,
        userReaction: data.userReaction || null,
      });
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan reaksi");
    } finally {
      setPending(false);
    }
  };

  const maxCount = Math.max(
    1,
    ...CONTENT_REACTIONS.map((r) => summary.counts[r.key] || 0),
  );

  return (
    <section
      className={cn(
        compact ? "border-t border-jepang-border pt-4" : "mt-12 pt-8 border-t-2 border-foreground",
      )}
      data-testid="reaction-bar"
    >
      {!compact ? (
        <h2 className="font-heading font-black text-2xl tracking-tighter mb-6">
          APA REAKSIMU?
          {summary.total > 0 && (
            <span className="text-jepang-red ml-2">({summary.total})</span>
          )}
        </h2>
      ) : null}

      <div
        className={cn(
          "grid gap-2",
          compact
            ? "grid-cols-5 sm:grid-cols-9"
            : "grid-cols-3 sm:grid-cols-5 lg:grid-cols-9",
        )}
      >
        {CONTENT_REACTIONS.map((r) => {
          const count = summary.counts[r.key] || 0;
          const active = summary.userReaction === r.key;
          const fill = Math.round(((count || 0) / maxCount) * 100);
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => react(r.key)}
              disabled={pending}
              aria-pressed={active}
              data-testid={`reaction-${r.key}`}
              className={cn(
                "group flex flex-col items-center border bg-background transition-colors disabled:opacity-60",
                compact ? "gap-1 p-2" : "gap-2 p-3",
                active
                  ? "border-jepang-red"
                  : "border-jepang-border hover:border-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full leading-none transition-transform group-hover:scale-110",
                  compact ? "h-8 w-8 text-lg" : "h-11 w-11 text-2xl",
                  active ? "bg-jepang-red/10" : "bg-jepang-off-white",
                )}
              >
                {r.emoji}
              </span>
              <span
                className={cn(
                  "font-heading font-black tabular-nums",
                  compact ? "text-sm" : "text-lg",
                  active ? "text-jepang-red" : "text-foreground",
                )}
              >
                {loading ? "·" : count}
              </span>
              {!compact ? (
                <>
                  <span className="h-1.5 w-full bg-jepang-border">
                    <span
                      className={cn(
                        "block h-full transition-all",
                        active ? "bg-jepang-red" : "bg-[#f5c518]",
                      )}
                      style={{ width: `${fill}%` }}
                    />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted">
                    {r.label}
                  </span>
                </>
              ) : null}
            </button>
          );
        })}
      </div>

      {!authUser && !compact ? (
        <p className="mt-4 text-center text-[11px] font-mono uppercase tracking-wider text-jepang-muted">
          Masuk untuk memberi reaksi
        </p>
      ) : null}
    </section>
  );
}
