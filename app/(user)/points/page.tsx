"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Award,
  BookOpen,
  Bookmark,
  Zap,
  MessageSquare,
  LogIn,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LeaderboardRowSkeleton from "@/components/skeletons/LeaderboardRowSkeleton";

const ACTIVITY_ICONS: Record<string, any> = {
  article_read: BookOpen,
  article_bookmarked: Bookmark,
  quiz_completed: Zap,
  quiz_correct_answer: Award,
  poll_joined: MessageSquare,
  daily_login: LogIn,
  article_shared: Share2,
};

const ACTIVITY_LABELS: Record<string, string> = {
  article_read: "Read Article",
  article_bookmarked: "Bookmarked Article",
  quiz_completed: "Completed Quiz",
  quiz_correct_answer: "Correct Quiz Answer",
  poll_joined: "Voted in Poll",
  daily_login: "Daily Login",
  article_shared: "Shared Article",
};

export default function PointsHistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/points/my")
      .then((r) => r.json())
      .then((d) => {
        setTransactions(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="points-page">
      <section className="border-b-2 border-foreground bg-jepang-red text-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 opacity-80">
            POINTS HISTORY
          </p>
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-black text-4xl tracking-tighter">
              Your Activity
            </h1>
            <div className="text-right">
              <p className="font-mono font-black text-5xl md:text-7xl">
                {(user as any)?.totalPoints || 0}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                TOTAL POINTS
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                RECENT TRANSACTIONS
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4].map((i) => (
                  <LeaderboardRowSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : transactions.length > 0 ? (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                RECENT TRANSACTIONS
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {transactions.map((t: any, idx: number) => {
                  const baseType = t.activityType?.replace(/_\d+$/, "");
                  const Icon = ACTIVITY_ICONS[baseType] || Award;
                  const label = ACTIVITY_LABELS[baseType] || t.activityType;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4"
                      data-testid={`transaction-${idx}`}
                    >
                      <div className="w-10 h-10 bg-jepang-off-white border border-jepang-border flex items-center justify-center">
                        <Icon size={18} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {t.description || label}
                        </p>
                        <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                          {new Date(t.occurredAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-mono font-black text-lg text-jepang-red">
                        +{t.points}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-24" data-testid="no-transactions">
            <Award
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />
            <p className="font-heading font-bold text-2xl mb-2">
              No points yet
            </p>
            <p className="text-jepang-muted">
              Start reading articles and taking quizzes to earn points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
