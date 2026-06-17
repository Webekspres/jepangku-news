"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Award, FileText, Bookmark } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Badge } from "@/components/ui/badge";
import {
  SkeletonBox,
  SkeletonAvatar,
} from "@/components/skeletons/PrimitiveSkeletons";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <AdminPageLayout
        testId="admin-user-detail-page"
        backHref="/admin/users"
        backLabel="Kembali ke Pengguna"
        title="Memuat..."
      >
        <div className="flex items-center gap-6 mb-8">
          <SkeletonAvatar size={64} />
          <div className="flex-1">
            <SkeletonBox height="1.6rem" width="40%" />
            <div className="mt-2">
              <SkeletonBox height="1rem" width="30%" />
            </div>
            <div className="flex gap-2 mt-3">
              <SkeletonBox height="1.6rem" width="4rem" />
              <SkeletonBox height="1.6rem" width="4rem" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 border bg-white">
              <SkeletonBox height="1rem" width="30%" />
              <div className="mt-3">
                <SkeletonBox height="2rem" width="100%" />
              </div>
              <div className="mt-2">
                <SkeletonBox height="0.8rem" width="50%" />
              </div>
            </div>
          ))}
        </div>

        <AdminCard variant="list" title="ARTIKEL" noPadding className="mb-6">
          <div className="divide-y divide-jepang-border">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <SkeletonBox height="1rem" width="12rem" />
                  <div className="mt-1">
                    <SkeletonBox height="0.8rem" width="8rem" />
                  </div>
                </div>
                <SkeletonBox height="1.6rem" width="4rem" />
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard variant="list" title="TRANSAKSI POIN TERBARU" noPadding>
          <div className="divide-y divide-jepang-border">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div>
                  <SkeletonBox height="1rem" width="12rem" />
                  <div className="mt-1">
                    <SkeletonBox height="0.8rem" width="8rem" />
                  </div>
                </div>
                <SkeletonBox height="1.6rem" width="4rem" />
              </div>
            ))}
          </div>
        </AdminCard>
      </AdminPageLayout>
    );
  if (!data) return null;

  const { user, articles, recentTransactions, stats } = data;

  return (
    <AdminPageLayout
      testId="admin-user-detail-page"
      backHref="/admin/users"
      backLabel="Kembali ke Pengguna"
      title={user.name}
      subtitle={`@${user.username} • ${user.email}`}
      headerActions={
        <div className="flex items-center gap-2">
          <Badge
            variant={
              user.role === "ADMIN"
                ? "red"
                : user.role === "CONTRIBUTOR"
                  ? "warning"
                  : "muted"
            }
          >
            {user.role === "ADMIN"
              ? "ADMIN"
              : user.role === "CONTRIBUTOR"
                ? "KONTRIBUTOR"
                : "PENGGUNA"}
          </Badge>
          <Badge variant={user.status === "active" ? "success" : "muted"}>
            {user.status === "active" ? "AKTIF" : "TIDAK AKTIF"}
          </Badge>
        </div>
      }
    >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Award,
              value: user.totalPoints || 0,
              label: "Total Poin",
              red: true,
            },
            {
              icon: FileText,
              value: stats?.articleCount || 0,
              label: "Artikel",
            },
            {
              icon: Bookmark,
              value: stats?.bookmarkCount || 0,
              label: "Markah",
            },
            {
              icon: Award,
              value: stats?.quizAttempts || 0,
              label: "Percobaan Kuis",
            },
          ].map(({ icon: Icon, value, label, red }, i) => (
            <div
              key={i}
              className={`p-5 border ${red ? "bg-jepang-red text-white border-jepang-red" : "bg-white border-foreground"}`}
            >
              <Icon size={24} strokeWidth={1.5} className="mb-2" />
              <p className="font-mono font-black text-3xl">{value}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        <AdminCard
          variant="list"
          title={`ARTIKEL (${articles?.length || 0})`}
          noPadding
        >
            {articles?.length > 0 ? (
              <div className="divide-y divide-jepang-border">
                {articles.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm">{a.title}</p>
                      <p className="text-xs text-jepang-muted font-mono uppercase">
                        {a.status === "PUBLISHED" ? "TERBIT" : a.status} •{" "}
                        {new Date(a.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    {a.status === "PUBLISHED" && (
                      <Link
                        href={`/artikel/${a.slug}`}
                        className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline"
                      >
                        Lihat
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-jepang-muted text-sm">
                Tidak ada artikel
              </p>
            )}
        </AdminCard>

        <AdminCard variant="list" title="TRANSAKSI POIN TERBARU" noPadding>
            {recentTransactions?.length > 0 ? (
              <div className="divide-y divide-jepang-border">
                {recentTransactions.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {t.description || t.activityType}
                      </p>
                      <p className="text-xs text-jepang-muted font-mono uppercase">
                        {new Date(t.occurredAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-jepang-red">
                      +{t.points}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-jepang-muted text-sm">
                Tidak ada transaksi
              </p>
            )}
        </AdminCard>
    </AdminPageLayout>
  );
}
