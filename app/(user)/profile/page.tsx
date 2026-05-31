"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Award,
  FileText,
  Bookmark as BookmarkIcon,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ articles: 0, bookmarks: 0 });
  const [recentPoints, setRecentPoints] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/articles/my").then((r) => r.json()),
      fetch("/api/bookmarks").then((r) => r.json()),
      fetch("/api/points/my").then((r) => r.json()),
    ]).then(([articles, bookmarks, points]) => {
      setStats({
        articles: Array.isArray(articles) ? articles.length : 0,
        bookmarks: Array.isArray(bookmarks) ? bookmarks.length : 0,
      });
      setRecentPoints(Array.isArray(points) ? points.slice(0, 5) : []);
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white min-h-screen" data-testid="profile-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-foreground text-white flex items-center justify-center font-heading font-black text-4xl border-2 border-foreground">
              {(user as any).name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
                PROFILE
              </p>
              <h1 className="font-heading font-black text-4xl tracking-tighter">
                {(user as any).name}
              </h1>
              <p className="text-jepang-muted font-mono">
                @{(user as any).username}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-jepang-red text-white p-6 border border-jepang-red">
            <Award size={32} strokeWidth={1.5} className="mb-3" />
            <p className="font-mono font-black text-4xl">
              {(user as any).totalPoints || 0}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mt-1">
              TOTAL POINTS
            </p>
          </div>
          <div className="bg-white border border-foreground p-6">
            <FileText
              size={32}
              strokeWidth={1.5}
              className="mb-3 text-foreground"
            />
            <p className="font-mono font-black text-4xl">{stats.articles}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mt-1 text-jepang-muted">
              ARTICLES SUBMITTED
            </p>
          </div>
          <div className="bg-white border border-foreground p-6">
            <BookmarkIcon
              size={32}
              strokeWidth={1.5}
              className="mb-3 text-foreground"
            />
            <p className="font-mono font-black text-4xl">{stats.bookmarks}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mt-1 text-jepang-muted">
              BOOKMARKS
            </p>
          </div>
        </div>

        <Card className="border border-foreground mb-8">
          <CardHeader className="border-b border-jepang-border py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              QUICK ACTIONS
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  href: "/submit-article",
                  icon: FileText,
                  label: "Submit",
                  testid: "action-submit-article",
                },
                {
                  href: "/my-articles",
                  icon: FileText,
                  label: "My Articles",
                  testid: "action-my-articles",
                },
                {
                  href: "/bookmarks",
                  icon: BookmarkIcon,
                  label: "Bookmarks",
                  testid: "action-bookmarks",
                },
                {
                  href: "/points",
                  icon: BarChart3,
                  label: "Points",
                  testid: "action-points",
                },
              ].map(({ href, icon: Icon, label, testid }) => (
                <Button
                  key={href}
                  variant="outline"
                  asChild
                  className="h-auto flex-col py-4 hover:bg-foreground hover:text-white"
                  data-testid={testid}
                >
                  <Link href={href}>
                    <Icon size={24} strokeWidth={1.5} className="mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      {label}
                    </p>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-foreground">
          <CardHeader className="border-b border-jepang-border py-3 flex flex-row items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              RECENT ACTIVITY
            </p>
            <Link
              href="/points"
              className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline"
              data-testid="view-all-points"
            >
              View All →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentPoints.length > 0 ? (
              <div className="divide-y divide-jepang-border">
                {recentPoints.map((t: any, idx: number) => (
                  <div
                    key={idx}
                    className="py-3 px-6 flex items-center justify-between"
                    data-testid={`recent-point-${idx}`}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {t.description || t.activityType}
                      </p>
                      <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                        {new Date(t.occurredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-jepang-red">
                      +{t.points}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-jepang-muted py-6 text-sm px-6">
                No activity yet. Start reading articles to earn points!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
