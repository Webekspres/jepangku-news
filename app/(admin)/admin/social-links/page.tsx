"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Link2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import {
  SOCIAL_PLATFORM_ORDER,
  SOCIAL_PLATFORM_META,
  type SocialLinkAdmin,
  type SocialPlatformId,
} from "@/lib/social-links-config";

type DraftLink = SocialLinkAdmin;

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<DraftLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<{ total: number; active: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/social-links/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/social-links")
      .then((r) => r.json())
      .then((data) => setLinks(Array.isArray(data.links) ? data.links : []))
      .finally(() => setLoading(false));
  }, []);

  const updateLink = (id: SocialPlatformId, patch: Partial<DraftLink>) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: links.map((link) => ({
            platform: link.id,
            url: link.href,
            isEnabled: link.isEnabled,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan");
        return;
      }
      setLinks(data.links ?? links);
      toast.success("Link sosial media disimpan");
      fetch("/api/admin/social-links/stats")
        .then((r) => r.json())
        .then(setStats);
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = links.filter((l) => l.isEnabled && l.href).length;

  return (
    <AdminPageLayout
      testId="admin-social-links"
      title="Sosial Media"
      subtitle="Kelola link profil yang tampil di navbar, sidebar, dan footer portal"
      headerActions={
        <Button onClick={handleSave} disabled={loading || saving} data-testid="social-save">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      }
    >
      <AdminStatCards
        loading={statsLoading}
        skeletonCount={2}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
        items={[
          {
            label: "Link Terisi",
            value: stats?.total ?? 0,
            icon: Link2,
            testId: "stat-total-link",
          },
          {
            label: "Link Aktif",
            value: stats?.active ?? 0,
            icon: CheckCircle,
            testId: "stat-link-aktif",
          },
        ]}
      />
      <AdminCard
        title={`${SOCIAL_PLATFORM_ORDER.length} PLATFORM · ${enabledCount} AKTIF`}
        variant="list"
        noPadding
      >
        {loading ? (
          <div className="divide-y divide-jepang-border">
            {SOCIAL_PLATFORM_ORDER.map((id) => (
              <div key={id} className="p-4">
                <SkeletonBox height="3rem" width="100%" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-jepang-border">
            {SOCIAL_PLATFORM_ORDER.map((id) => {
              const meta = SOCIAL_PLATFORM_META[id];
              const link = links.find((item) => item.id === id) ?? {
                id,
                label: meta.label,
                href: meta.defaultUrl,
                isEnabled: true,
                sortOrder: 0,
              };

              return (
                <div
                  key={id}
                  className="p-4 hover:bg-jepang-off-white transition-colors"
                  data-testid={`social-link-row-${id}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0 sm:w-36 shrink-0">
                      <span className="font-semibold text-sm">{meta.label}</span>
                      <Badge variant={link.isEnabled ? "success" : "muted"}>
                        {link.isEnabled ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Input
                        id={`social-url-${id}`}
                        type="url"
                        placeholder={meta.defaultUrl}
                        value={link.href}
                        onChange={(e) => updateLink(id, { href: e.target.value })}
                        disabled={!link.isEnabled}
                        data-testid={`social-url-${id}`}
                      />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`social-enabled-${id}`}
                          className="text-xs text-jepang-muted whitespace-nowrap"
                        >
                          Tampilkan
                        </Label>
                        <Switch
                          id={`social-enabled-${id}`}
                          checked={link.isEnabled}
                          onCheckedChange={(checked) =>
                            updateLink(id, { isEnabled: checked })
                          }
                          data-testid={`social-enabled-${id}`}
                        />
                      </div>
                      {link.isEnabled && link.href ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            prefetch={false}
                          >
                            <ExternalLink size={14} className="mr-1.5" />
                            Pratinjau
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>
    </AdminPageLayout>
  );
}
