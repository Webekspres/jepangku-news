"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag as TagIcon } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import TagFormModal, { type TagFormValues } from "@/components/admin/tags/TagFormModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";

type Tag = {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
};

const EMPTY_FORM: TagFormValues = { name: "" };

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formValues, setFormValues] = useState<TagFormValues>(EMPTY_FORM);
  const { confirm, confirmProps } = useConfirm();

  const usedTagCount = tags.filter((t) => t.usageCount > 0).length;

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    const data = await fetch("/api/admin/tags").then((r) => r.json());
    setTags(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingTag(null);
    setFormValues(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    setModalMode("edit");
    setEditingTag(tag);
    setFormValues({ name: tag.name });
    setModalOpen(true);
  };

  const handleFormSubmit = async (values: TagFormValues) => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        const res = await fetch("/api/admin/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: values.name.trim() }),
        });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error);
        }
        toast.success("Tag berhasil dibuat");
      } else if (editingTag) {
        const res = await fetch(`/api/admin/tags/${editingTag.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: values.name.trim() }),
        });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error);
        }
        toast.success("Tag berhasil diperbarui");
      }

      setModalOpen(false);
      loadTags();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (tag: Tag) => {
    if (tag.usageCount > 0) {
      toast.error(`Tidak dapat menghapus: tag digunakan oleh ${tag.usageCount} artikel`);
      return;
    }

    confirm({
      title: `Hapus "${tag.name}"?`,
      description: "Tag akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.",
      confirmLabel: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
        if (!res.ok) {
          const e = await res.json();
          toast.error(e.error || "Gagal menghapus tag");
          return;
        }
        toast.success("Tag berhasil dihapus");
        loadTags();
      },
    });
  };

  return (
    <>
      <ConfirmModal {...confirmProps} />
      <TagFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={formValues}
        saving={saving}
        onOpenChange={setModalOpen}
        onSubmit={handleFormSubmit}
      />

      <AdminPageLayout
        testId="admin-tags-page"
        label="MANAJEMEN TAG"
        title={
          <>
            <TagIcon size={36} strokeWidth={1.5} className="inline mr-3" />
            Tag
          </>
        }
        headerActions={
          <Button onClick={openCreateModal} data-testid="toggle-create-form-btn">
            <Plus size={14} strokeWidth={1.5} />
            Tambah Tag
          </Button>
        }
      >
        <AdminStatCards
          loading={loading}
          skeletonCount={2}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
          items={[
            {
              label: "Total Tag",
              value: tags.length,
              icon: TagIcon,
              testId: "stat-total-tag",
            },
            {
              label: "Digunakan Artikel",
              value: usedTagCount,
              icon: TagIcon,
              testId: "stat-used-tag",
            },
          ]}
        />

        {loading ? (
          <AdminCard title="TAG" variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SkeletonBox height="1rem" width="6rem" />
                    <SkeletonBox height="0.8rem" width="4rem" />
                  </div>
                  <div className="flex items-center gap-3">
                    <SkeletonBox height="0.8rem" width="4rem" />
                    <SkeletonBox height="1.6rem" width="2rem" />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        ) : tags.length === 0 ? (
          <div data-testid="no-tags">
            <AdminEmptyState
              icon={TagIcon}
              title="Belum ada tag"
              description="Tambahkan tag pertama melalui tombol di atas"
            />
          </div>
        ) : (
          <AdminCard title={`${tags.length} TAG`} variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-jepang-off-white transition-colors"
                  data-testid={`tag-row-${tag.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge>#{tag.name}</Badge>
                    </div>
                    <span className="text-xs text-jepang-muted font-mono">/{tag.slug}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                      {tag.usageCount || 0} artikel
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(tag)}
                      className="border border-jepang-border hover:border-foreground"
                      title="Edit tag"
                      data-testid={`edit-tag-${tag.id}`}
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag)}
                      disabled={tag.usageCount > 0}
                      className="border border-jepang-border hover:border-jepang-red hover:text-jepang-red disabled:opacity-30"
                      data-testid={`delete-tag-${tag.id}`}
                      title={
                        tag.usageCount > 0
                          ? "Tag sedang digunakan oleh artikel"
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
        )}

        <div className="p-4 border border-jepang-border bg-jepang-off-white text-xs text-jepang-muted space-y-1">
          <p className="font-semibold uppercase tracking-[0.15em] text-foreground mb-2">Info</p>
          <p>• Tag hanya dapat <strong>dihapus</strong> jika tidak ada artikel yang menggunakannya.</p>
          <p>• Slug tag dibuat otomatis dari nama saat tag dibuat atau diubah.</p>
        </div>
      </AdminPageLayout>
    </>
  );
}
