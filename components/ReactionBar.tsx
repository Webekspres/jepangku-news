"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ReactionTargetType = "ARTICLE" | "POLL" | "QUIZ";

type ReactionKey =
  | "LOVE"
  | "LOL"
  | "CUTE"
  | "WIN"
  | "WTF"
  | "OMG"
  | "GEEKY"
  | "SCARY"
  | "FAIL";

const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: "LOVE", emoji: "❤️", label: "Love" },
  { key: "LOL", emoji: "😂", label: "Lol" },
  { key: "CUTE", emoji: "🥰", label: "Cute" },
  { key: "WIN", emoji: "😎", label: "Win" },
  { key: "WTF", emoji: "🤨", label: "WTF" },
  { key: "OMG", emoji: "😮", label: "OMG" },
  { key: "GEEKY", emoji: "🤓", label: "Geeky" },
  { key: "SCARY", emoji: "😱", label: "Scary" },
  { key: "FAIL", emoji: "😖", label: "Fail" },
];

type Summary = {
  counts: Record<string, number>;
  total: number;
  userReaction: ReactionKey | null;
};

export default function ReactionBar({
  targetType,
  targetId,
}: {
  targetType: ReactionTargetType;
  targetId: string;
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

  const maxCount = Math.max(1, ...REACTIONS.map((r) => summary.counts[r.key] || 0));

  return (
    <section className="mt-12 pt-8 border-t-2 border-foreground" data-testid="reaction-bar">
      <h2 className="font-heading font-black text-2xl tracking-tighter mb-6">
        APA REAKSIMU?
        {summary.total > 0 && (
          <span className="text-jepang-red ml-2">({summary.total})</span>
        )}
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {REACTIONS.map((r) => {
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
                "group flex flex-col items-center gap-2 border bg-background p-3 transition-colors disabled:opacity-60",
                active
                  ? "border-jepang-red"
                  : "border-jepang-border hover:border-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none transition-transform group-hover:scale-110",
                  active ? "bg-jepang-red/10" : "bg-jepang-off-white",
                )}
              >
                {r.emoji}
              </span>
              <span
                className={cn(
                  "font-heading text-lg font-black tabular-nums",
                  active ? "text-jepang-red" : "text-foreground",
                )}
              >
                {loading ? "·" : count}
              </span>
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
            </button>
          );
        })}
      </div>

      {!authUser && (
        <p className="mt-4 text-center text-[11px] font-mono uppercase tracking-wider text-jepang-muted">
          Masuk untuk memberi reaksi
        </p>
      )}
    </section>
  );
}
