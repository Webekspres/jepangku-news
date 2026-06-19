"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  EyeOff,
  Eye,
  X,
  Check,
} from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  articleCount: number;
};

type FormState = {
  name: string;
  description: string;
  iconUrl: string;
  color: string;
};

const EMPTY_FORM: FormState = { name: "", description: "", iconUrl: "", color: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form: create
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form: edit (inline per row)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetch("/api/admin/categories").then((r) => r.json());
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  // ── Create ──────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }

      toast.success("Kategori berhasil dibuat");
      setCreateForm(EMPTY_FORM);
      setShowCreateForm(false);
      loadCategories();
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat kategori");
    } finally {
      setSaving(false);
    }
  };

  // TODO: buat dengan modal untuk form create dan edit kategori hilangkan inputan tidak penting seperti kode hexa dan url icon karena itu tidak dipakai di aplikasi, tambahkan togle untuk tampilkan di navbar dengan batas isi navbar 9 kategori saja jika lebih disable kategori lainnya yang tidak ditampilkan, kemudian layoutnya juga dirapihkan 
  // TODO: di bagian atas adalah card yang berisi info kategori seperti total kategori dan total kategori di navbar misal 9/10 kategori yang ditampilkan di navbar

  // ── Toggle aktif/nonaktif ────────────────────────────────
  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });

      if (!res.ok) throw new Error();

      toast.success(cat.isActive ? "Kategori dinonaktifkan" : "Kategori diaktifkan");
      loadCategories();
    } catch {
      toast.error("Gagal mengubah status kategori");
    }
  };

  // ── Edit ─────────────────────────────────────────────────
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      description: cat.description ?? "",
      iconUrl: cat.iconUrl ?? "",
      color: cat.color ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleUpdate = async (catId: string) => {
    if (!editForm.name.trim()) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }

      toast.success("Kategori berhasil diperbarui");
      cancelEdit();
      loadCategories();
    } catch (e: any) {
      toast.error(e.message || "Gagal memperbarui kategori");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = (cat: Category) => {
    if (cat.articleCount > 0) {
      toast.error(
        `Tidak dapat menghapus: "${cat.name}" masih digunakan oleh ${cat.articleCount} artikel. Nonaktifkan saja jika tidak ingin ditampilkan.`,
        { duration: 5000 },
      );
      return;
    }

    confirm({
      title: `Hapus "${cat.name}"?`,
      description:
        "Kategori akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.",
      confirmLabel: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/categories/${cat.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const e = await res.json();
          toast.error(e.error || "Gagal menghapus kategori");
          return;
        }

        toast.success("Kategori berhasil dihapus");
        loadCategories();
      },
    });
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-categories-page"
        label="MANAJEMEN KATEGORI"
        title={
          <>
            <LayoutGrid size={36} strokeWidth={1.5} className="inline mr-3" />
            Kategori
          </>
        }
        headerActions={
          <Button
            onClick={() => setShowCreateForm((v) => !v)}
            data-testid="toggle-create-form-btn"
          >
            <Plus size={14} strokeWidth={1.5} />
            Tambah Kategori
          </Button>
        }
      >
        {showCreateForm && (
          <AdminCard
            title="BUAT KATEGORI BARU"
            variant="list"
            testId="create-category-form"
          >
            <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                      Nama <span className="text-jepang-red">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="contoh: Anime, Budaya, Wisata"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, name: e.target.value }))
                      }
                      data-testid="create-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                      Deskripsi
                    </label>
                    <Input
                      type="text"
                      placeholder="Deskripsi singkat kategori"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, description: e.target.value }))
                      }
                      data-testid="create-description-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                      Warna (hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="#E53E3E"
                        value={createForm.color}
                        onChange={(e) =>
                          setCreateForm((f) => ({ ...f, color: e.target.value }))
                        }
                        className="flex-1"
                        data-testid="create-color-input"
                      />
                      {createForm.color && (
                        <div
                          className="h-10 w-10 border border-jepang-border shrink-0"
                          style={{ backgroundColor: createForm.color }}
                          aria-hidden
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                      URL Ikon
                    </label>
                    <Input
                      type="text"
                      placeholder="https://..."
                      value={createForm.iconUrl}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, iconUrl: e.target.value }))
                      }
                      data-testid="create-icon-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={saving} data-testid="create-category-btn">
                    <Check size={14} strokeWidth={1.5} />
                    {saving ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateForm(EMPTY_FORM);
                      setShowCreateForm(false);
                    }}
                  >
                    <X size={14} strokeWidth={1.5} />
                    Batal
                  </Button>
                </div>
              </form>
          </AdminCard>
        )}

        {loading ? (
          <AdminCard title="KATEGORI" variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SkeletonBox height="1rem" width="6rem" />
                      <SkeletonBox height="0.8rem" width="4rem" />
                    </div>
                    <div className="flex items-center gap-3">
                      <SkeletonBox height="0.8rem" width="4rem" />
                      <SkeletonBox height="1.6rem" width="5rem" />
                    </div>
                  </div>
                ))}
              </div>
          </AdminCard>
        ) : categories.length === 0 ? (
          <div data-testid="no-categories">
            <AdminEmptyState
              icon={LayoutGrid}
              title="Belum ada kategori"
              description="Tambahkan kategori pertama melalui tombol di atas"
            />
          </div>
        ) : (
          <AdminCard title={`${categories.length} KATEGORI`} variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
                {categories.map((cat) =>
                  editingId === cat.id ? (
                    /* ── Edit row ── */
                    <div
                      key={cat.id}
                      className="p-4 bg-jepang-off-white"
                      data-testid={`edit-row-${cat.id}`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                            Nama <span className="text-jepang-red">*</span>
                          </label>
                          <Input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, name: e.target.value }))
                            }
                            data-testid={`edit-name-${cat.id}`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                            Deskripsi
                          </label>
                          <Input
                            type="text"
                            placeholder="Deskripsi singkat"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, description: e.target.value }))
                            }
                            data-testid={`edit-description-${cat.id}`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                            Warna (hex)
                          </label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder="#E53E3E"
                              value={editForm.color}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, color: e.target.value }))
                              }
                              className="flex-1"
                              data-testid={`edit-color-${cat.id}`}
                            />
                            {editForm.color && (
                              <div
                                className="h-10 w-10 border border-jepang-border shrink-0"
                                style={{ backgroundColor: editForm.color }}
                                aria-hidden
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-[0.15em] mb-1">
                            URL Ikon
                          </label>
                          <Input
                            type="text"
                            placeholder="https://..."
                            value={editForm.iconUrl}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, iconUrl: e.target.value }))
                            }
                            data-testid={`edit-icon-${cat.id}`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={saving}
                          onClick={() => handleUpdate(cat.id)}
                          data-testid={`save-edit-${cat.id}`}
                        >
                          <Check size={12} />
                          {saving ? "Menyimpan..." : "Simpan"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          data-testid={`cancel-edit-${cat.id}`}
                        >
                          <X size={12} /> Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ── Display row ── */
                    <div
                      key={cat.id}
                      className="p-4 flex items-center justify-between hover:bg-jepang-off-white transition-colors"
                      data-testid={`category-row-${cat.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Color swatch */}
                        {cat.color && (
                          <div
                            className="h-4 w-4 shrink-0 border border-jepang-border"
                            style={{ backgroundColor: cat.color }}
                            aria-hidden
                          />
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{cat.name}</span>
                            {!cat.isActive && (
                              <Badge variant="muted">Nonaktif</Badge>
                            )}
                          </div>
                          <span className="text-xs text-jepang-muted font-mono">
                            /{cat.slug}
                          </span>
                          {cat.description && (
                            <p className="text-xs text-jepang-muted mt-0.5 truncate max-w-xs">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider hidden sm:inline">
                          {cat.articleCount} ARTIKEL
                        </span>

                        {/* Toggle aktif */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(cat)}
                          className="border border-jepang-border hover:border-foreground"
                          title={cat.isActive ? "Nonaktifkan kategori" : "Aktifkan kategori"}
                          data-testid={`toggle-active-${cat.id}`}
                        >
                          {cat.isActive ? (
                            <Eye size={14} strokeWidth={1.5} />
                          ) : (
                            <EyeOff size={14} strokeWidth={1.5} />
                          )}
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(cat)}
                          className="border border-jepang-border hover:border-foreground"
                          title="Edit kategori"
                          data-testid={`edit-btn-${cat.id}`}
                        >
                          <Pencil size={14} strokeWidth={1.5} />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cat)}
                          disabled={cat.articleCount > 0}
                          className="border border-jepang-border hover:border-jepang-red hover:text-jepang-red disabled:opacity-30"
                          title={
                            cat.articleCount > 0
                              ? "Kategori sedang digunakan oleh artikel"
                              : "Hapus kategori"
                          }
                          data-testid={`delete-btn-${cat.id}`}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
          </AdminCard>
        )}

        <div className="p-4 border border-jepang-border bg-jepang-off-white text-xs text-jepang-muted space-y-1">
          <p className="font-semibold uppercase tracking-[0.15em] text-foreground mb-2">INFO</p>
          <p>• Kategori yang <strong>dinonaktifkan</strong> tidak akan tampil di filter publik, tetapi artikel yang terhubung tetap aman.</p>
          <p>• Kategori hanya dapat <strong>dihapus</strong> jika tidak ada artikel yang menggunakannya.</p>
          <p>• Gunakan tombol mata (👁) untuk mengaktifkan atau menonaktifkan kategori tanpa menghapus data.</p>
        </div>
      </AdminPageLayout>
    </>
  );
}
