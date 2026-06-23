"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Award,
  FileText,
  Bookmark as BookmarkIcon,
  BarChart3,
  Pencil,
  PenSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/media/UserAvatar";
import {
  canCreateArticles,
  getContributorCta,
} from "@/lib/contributor";

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ articles: 0, bookmarks: 0 });
  const [recentPoints, setRecentPoints] = useState<any[]>([]);
  const [bio, setBio] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      canCreateArticles(user)
        ? fetch("/api/articles/my").then((r) => parseApiResponse(r))
        : Promise.resolve([]),
      fetch("/api/bookmarks").then((r) => parseApiResponse(r)),
      fetch("/api/points/my").then((r) => parseApiResponse(r)),
      fetch("/api/user/profile").then((r) => parseApiResponse(r)),
    ]).then(([articles, bookmarks, points, profile]) => {
      setStats({
        articles: Array.isArray(articles) ? articles.length : 0,
        bookmarks: Array.isArray(bookmarks) ? bookmarks.length : 0,
      });
      setRecentPoints(Array.isArray(points) ? points.slice(0, 5) : []);
      setBio(profile?.bio ?? null);
    });
  }, [user]);

  if (!user) return null;

  const contributorCta = getContributorCta(user);
  const articleActions = canCreateArticles(user)
    ? [
        {
          href: "/submit-article",
          icon: FileText,
          label: "Kirim Artikel",
          testid: "action-submit-article",
        },
        {
          href: "/my-articles",
          icon: FileText,
          label: "Artikel Saya",
          testid: "action-my-articles",
        },
      ]
    : [
        {
          href: contributorCta.href,
          icon: PenSquare,
          label: contributorCta.label,
          testid: "action-contributor-apply",
        },
      ];

  return (
    <div className="bg-white min-h-screen" data-testid="profile-page">
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              <UserAvatar
                src={(user as any).avatarUrl}
                alt={(user as any).name}
                size={96}
                fallbackInitial={(user as any).name}
                testId="profile-avatar"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
                PROFIL
              </p>
              <h1 className="font-heading font-black text-4xl tracking-tighter">
                {(user as any).name}
              </h1>
              <p className="text-jepang-muted font-mono">
                @{(user as any).username}
              </p>
              {bio && (
                <p className="mt-2 text-sm text-jepang-muted max-w-lg">{bio}</p>
              )}
            </div>
            <Button
              variant="outline"
              asChild
              className="shrink-0 hover:bg-foreground hover:text-white"
              data-testid="edit-profile-btn"
            >
              <Link href="/profile/edit">
                <Pencil size={14} className="mr-2" />
                Edit Profil
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-jepang-red text-white p-6 border border-jepang-red">
            <Award size={32} strokeWidth={1.5} className="mb-3" />
            <p className="font-mono font-black text-4xl">
              {user?.totalPoints || 0}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mt-1">
              TOTAL POIN
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
              ARTIKEL DIKIRIM
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
              TERSIMPAN
            </p>
          </div>
        </div>

        <Card className="border border-foreground mb-8">
          <CardHeader className="border-b border-jepang-border py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              AKSI CEPAT
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                ...articleActions,
                {
                  href: "/bookmarks",
                  icon: BookmarkIcon,
                  label: "Tersimpan",
                  testid: "action-bookmarks",
                },
                {
                  href: "/activity",
                  icon: BarChart3,
                  label: "Poin",
                  testid: "action-points",
                },
                {
                  href: "/profile/edit",
                  icon: Pencil,
                  label: "Edit Profil",
                  testid: "action-edit-profile",
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
              AKTIVITAS TERBARU
            </p>
            <Link
              href="/activity"
              className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline"
              data-testid="view-all-points"
            >
              Lihat Semua →
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
                Belum ada aktivitas. Baca artikel untuk mendapat poin!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
