"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    const data = await fetch("/api/admin/tags").then((r) => r.json());
    setTags(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTagName.trim()) return;

    setCreating(true);

    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }

      toast.success("Tag berhasil dibuat");
      setNewTagName("");
      loadTags();
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat tag");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tagId: string, usage: number) => {
    if (usage > 0) {
      toast.error(`Tidak dapat menghapus: tag digunakan oleh ${usage} artikel`);
      return;
    }

    confirm({
      title: "Hapus Tag?",
      description: "Tag ini akan dihapus secara permanen dan tidak bisa dipulihkan.",
      confirmLabel: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        await fetch(`/api/admin/tags/${tagId}`, { method: "DELETE" });
        toast.success("Tag berhasil dihapus");
        loadTags();
      },
    });
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-tags-page">
      <ConfirmModal {...confirmProps} />
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            MANAJEMEN TAG
          </p>

          <h1 className="font-heading font-black text-4xl tracking-tighter flex items-center gap-3">
            <TagIcon size={36} strokeWidth={1.5} /> Tag
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        <Card
          className="border border-foreground mb-6"
          data-testid="create-tag-form"
        >
          <CardHeader className="pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">
              BUAT TAG BARU
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-2">
              <Input
                type="text"
                placeholder="Nama tag, contoh: tokyo, sushi"
                className="flex-1"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                data-testid="new-tag-input"
              />

              <Button
                type="submit"
                disabled={creating}
                data-testid="create-tag-btn"
              >
                <Plus size={14} strokeWidth={1.5} />
                {creating ? "Membuat..." : "Buat"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                TAG
              </p>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <SkeletonBox height="1rem" width="6rem" />

                      <div className="text-xs text-jepang-muted font-mono">
                        <SkeletonBox height="0.8rem" width="4rem" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <SkeletonBox height="0.8rem" width="4rem" />
                      <SkeletonBox height="1.6rem" width="2rem" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : tags.length > 0 ? (
          <Card className="border border-foreground">
            <CardHeader className="border-b border-jepang-border bg-jepang-off-white py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                {tags.length} TAG
              </p>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-jepang-border">
                {tags.map((tag: any) => (
                  <div
                    key={tag.id}
                    className="p-4 flex items-center justify-between hover:bg-jepang-off-white transition-colors"
                    data-testid={`tag-row-${tag.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge>#{tag.name}</Badge>

                      <span className="text-xs text-jepang-muted font-mono">
                        /{tag.slug}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                        {tag.usageCount || 0} ARTIKEL
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDelete(tag.id, tag.usageCount || 0)
                        }
                        disabled={tag.usageCount > 0}
                        className="border border-jepang-border hover:border-jepang-red hover:text-jepang-red disabled:opacity-30"
                        data-testid={`delete-tag-${tag.id}`}
                        title={
                          tag.usageCount > 0
                            ? "Tag sedang digunakan"
                            : "Hapus tag"
                        }
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-24" data-testid="no-tags">
            <TagIcon
              size={48}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-jepang-muted"
            />

            <p className="font-heading font-bold text-2xl mb-2">
              Belum ada tag
            </p>

            <p className="text-jepang-muted">
              Buat tag pertama Anda melalui form di atas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
