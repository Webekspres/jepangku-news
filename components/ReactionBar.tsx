"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactionIcon from "@/components/reactions/ReactionIcon";
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

/** Tunggu sebentar sebelum sync ke server — klik berulang hanya kirim reaksi terakhir. */
const REACTION_DEBOUNCE_MS = 2_000;

function applyOptimisticReaction(summary: Summary, type: ReactionKey): Summary {
  const prev = summary.userReaction;
  const counts = { ...summary.counts };

  if (prev === type) {
    counts[type] = Math.max(0, (counts[type] || 0) - 1);
    const total = Math.max(0, summary.total - 1);
    return { counts, total, userReaction: null };
  }

  if (prev) counts[prev] = Math.max(0, (counts[prev] || 0) - 1);
  counts[type] = (counts[type] || 0) + 1;
  const total = prev ? summary.total : summary.total + 1;
  return { counts, total, userReaction: type };
}

function reactionTypeToPost(
  committed: ReactionKey | null,
  desired: ReactionKey | null,
): ReactionKey | null {
  if (committed === desired) return null;
  return desired ?? committed;
}

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

  const summaryRef = useRef(summary);
  const committedRef = useRef<ReactionKey | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reactions?targetType=${targetType}&targetId=${targetId}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) {
        const next: Summary = {
          counts: data.counts || {},
          total: data.total || 0,
          userReaction: data.userReaction || null,
        };
        setSummary(next);
        summaryRef.current = next;
        committedRef.current = next.userReaction;
      }
    } catch {
      // diamkan: bar reaksi tidak boleh memblok halaman
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  const flushSync = useCallback(async () => {
    const desired = summaryRef.current.userReaction;
    const committed = committedRef.current;
    const typeToPost = reactionTypeToPost(committed, desired);
    if (!typeToPost) return;

    if (syncInFlightRef.current) return;

    syncInFlightRef.current = true;
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetType, targetId, type: typeToPost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan reaksi");

      const synced: Summary = {
        counts: data.counts || {},
        total: data.total || 0,
        userReaction: data.userReaction || null,
      };
      setSummary(synced);
      summaryRef.current = synced;
      committedRef.current = synced.userReaction;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal menyimpan reaksi";
      toast.error(message);
      await load();
    } finally {
      syncInFlightRef.current = false;
      if (summaryRef.current.userReaction !== committedRef.current) {
        queueMicrotask(() => void flushSync());
      }
    }
  }, [load, targetId, targetType]);

  const scheduleSync = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void flushSync();
    }, REACTION_DEBOUNCE_MS);
  }, [flushSync]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (summaryRef.current.userReaction !== committedRef.current) {
        const typeToPost = reactionTypeToPost(
          committedRef.current,
          summaryRef.current.userReaction,
        );
        if (typeToPost) {
          void fetch("/api/reactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            keepalive: true,
            body: JSON.stringify({ targetType, targetId, type: typeToPost }),
          });
        }
      }
    };
  }, [targetId, targetType]);

  const react = (type: ReactionKey) => {
    if (!authUser) {
      toast.error("Silakan masuk untuk memberi reaksi");
      return;
    }

    const next = applyOptimisticReaction(summaryRef.current, type);
    setSummary(next);
    summaryRef.current = next;
    scheduleSync();
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
          const iconSize = compact ? 28 : 36;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => react(r.key)}
              aria-pressed={active}
              data-testid={`reaction-${r.key}`}
              className={cn(
                "group flex flex-col items-center border bg-background transition-colors",
                compact ? "gap-1 p-2" : "gap-2 p-3",
                active
                  ? "border-jepang-red"
                  : "border-jepang-border hover:border-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full transition-transform group-hover:scale-110",
                  compact ? "h-8 w-8" : "h-11 w-11",
                  active ? "bg-jepang-red/10" : "bg-jepang-off-white",
                )}
              >
                <ReactionIcon src={r.iconSrc} size={iconSize} />
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
