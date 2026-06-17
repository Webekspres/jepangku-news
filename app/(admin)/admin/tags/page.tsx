"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Tag as TagIcon } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-tags-page"
        label="MANAJEMEN TAG"
        title={
          <>
            <TagIcon size={36} strokeWidth={1.5} className="inline mr-3" />
            Tag
          </>
        }
      >
        <AdminCard title="BUAT TAG BARU" variant="list" testId="create-tag-form">
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
        </AdminCard>

        {loading ? (
          <AdminCard title="TAG" variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
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
          </AdminCard>
        ) : tags.length > 0 ? (
          <AdminCard title={`${tags.length} TAG`} variant="list" noPadding>
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
          </AdminCard>
        ) : (
          <div data-testid="no-tags">
            <AdminEmptyState
              icon={TagIcon}
              title="Belum ada tag"
              description="Buat tag pertama Anda melalui form di atas"
            />
          </div>
        )}
      </AdminPageLayout>
    </>
  );
}
