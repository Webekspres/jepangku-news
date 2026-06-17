"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Share2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import {
  SOCIAL_PLATFORM_ORDER,
  SOCIAL_PLATFORM_META,
  type SocialLinkAdmin,
  type SocialPlatformId,
} from "@/lib/social-links";

type DraftLink = SocialLinkAdmin;

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<DraftLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 lg:px-6" data-testid="admin-social-links">
      <SectionHeader
        label="管理 / ADMIN"
        title="Sosial Media"
        subtitle="Kelola link profil yang tampil di navbar dan sidebar portal"
        className="border-b border-jepang-border bg-jepang-navy text-white"
        fullWidth
      />

      <div className="py-12">
        <div className="border border-jepang-border bg-white">
          <div className="flex items-center gap-3 border-b border-jepang-border px-5 py-4">
            <Share2 size={18} strokeWidth={1.5} />
            <p className="font-heading text-lg font-bold">Profil Sosial Media</p>
          </div>

          {loading ? (
            <div className="space-y-4 p-5">
              {SOCIAL_PLATFORM_ORDER.map((id) => (
                <SkeletonBox key={id} height="4rem" width="100%" />
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
                    className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-end"
                    data-testid={`social-link-row-${id}`}
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor={`social-url-${id}`} className="font-semibold">
                          {meta.label}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`social-enabled-${id}`} className="text-xs text-jepang-muted">
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
                      </div>
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
                    {link.isEnabled && link.href ? (
                      <Button variant="outline" size="sm" asChild className="shrink-0">
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
                );
              })}
            </div>
          )}

          <div className="flex justify-end border-t border-jepang-border px-5 py-4">
            <Button onClick={handleSave} disabled={loading || saving} data-testid="social-save">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
