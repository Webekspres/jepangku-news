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
} from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import CategoryFormModal, {
  type CategoryFormValues,
} from "@/components/admin/categories/CategoryFormModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import { MAX_NAVBAR_CATEGORIES } from "@/lib/categories/constants";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  showInNavbar: boolean;
  sortOrder: number;
  articleCount: number;
};

const EMPTY_FORM: CategoryFormValues = {
  name: "",
  description: "",
  showInNavbar: false,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormValues>(EMPTY_FORM);

  const { confirm, confirmProps } = useConfirm();

  const navbarCount = categories.filter((c) => c.showInNavbar).length;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetch("/api/admin/categories").then((r) => r.json());
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingCategory(null);
    setFormValues(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setModalMode("edit");
    setEditingCategory(cat);
    setFormValues({
      name: cat.name,
      description: cat.description ?? "",
      showInNavbar: cat.showInNavbar,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error);
        }
        toast.success("Kategori berhasil dibuat");
      } else if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error);
        }
        toast.success("Kategori berhasil diperbarui");
      }

      setModalOpen(false);
      loadCategories();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan kategori");
    } finally {
      setSaving(false);
    }
  };

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

  const handleToggleNavbar = async (cat: Category, checked: boolean) => {
    if (checked && navbarCount >= MAX_NAVBAR_CATEGORIES && !cat.showInNavbar) {
      toast.error(`Maksimal ${MAX_NAVBAR_CATEGORIES} kategori di navbar`);
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInNavbar: checked }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
      toast.success(checked ? "Kategori ditampilkan di navbar" : "Kategori disembunyikan dari navbar");
      loadCategories();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mengubah navbar");
    }
  };

  const handleDelete = (cat: Category) => {
    if (cat.articleCount > 0) {
      toast.error(
        `Tidak dapat menghapus: "${cat.name}" masih digunakan oleh ${cat.articleCount} artikel.`,
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

  return (
    <>
      <ConfirmModal {...confirmProps} />
      <CategoryFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={formValues}
        navbarCount={navbarCount}
        saving={saving}
        onOpenChange={setModalOpen}
        onSubmit={handleFormSubmit}
      />

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
          <Button onClick={openCreateModal} data-testid="toggle-create-form-btn">
            <Plus size={14} strokeWidth={1.5} />
            Tambah Kategori
          </Button>
        }
      >
        <AdminStatCards
          loading={loading}
          skeletonCount={2}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
          items={[
            {
              label: "Total Kategori",
              value: categories.length,
              icon: LayoutGrid,
              testId: "stat-total-kategori",
            },
            {
              label: "Di Navbar",
              value: `${navbarCount}/${MAX_NAVBAR_CATEGORIES}`,
              icon: Eye,
              testId: "stat-navbar-kategori",
            },
          ]}
        />

        {loading ? (
          <AdminCard title="KATEGORI" variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <SkeletonBox height="1rem" width="6rem" />
                  <SkeletonBox height="1.6rem" width="5rem" />
                </div>
              ))}
            </div>
          </AdminCard>
        ) : categories.length === 0 ? (
          <AdminEmptyState
            icon={LayoutGrid}
            title="Belum ada kategori"
            description="Tambahkan kategori pertama melalui tombol di atas"
          />
        ) : (
          <AdminCard title={`${categories.length} KATEGORI`} variant="list" noPadding>
            <div className="divide-y divide-jepang-border">
              {categories.map((cat) => {
                const navbarDisabled =
                  navbarCount >= MAX_NAVBAR_CATEGORIES && !cat.showInNavbar;

                return (
                  <div
                    key={cat.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-jepang-off-white transition-colors"
                    data-testid={`category-row-${cat.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{cat.name}</span>
                        {!cat.isActive && <Badge variant="muted">Nonaktif</Badge>}
                        {cat.showInNavbar && <Badge variant="success">Navbar</Badge>}
                      </div>
                      <span className="text-xs text-jepang-muted font-mono">/{cat.slug}</span>
                      {cat.description ? (
                        <p className="text-xs text-jepang-muted mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">
                        {cat.articleCount} artikel
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-jepang-muted">Navbar</span>
                        <Switch
                          checked={cat.showInNavbar}
                          disabled={navbarDisabled}
                          onCheckedChange={(checked) => handleToggleNavbar(cat, checked)}
                          data-testid={`navbar-toggle-${cat.id}`}
                        />
                      </div>

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

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(cat)}
                        className="border border-jepang-border hover:border-foreground"
                        title="Edit kategori"
                        data-testid={`edit-btn-${cat.id}`}
                      >
                        <Pencil size={14} strokeWidth={1.5} />
                      </Button>

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
                );
              })}
            </div>
          </AdminCard>
        )}

        <div className="p-4 border border-jepang-border bg-jepang-off-white text-xs text-jepang-muted space-y-1">
          <p className="font-semibold uppercase tracking-[0.15em] text-foreground mb-2">Info</p>
          <p>• Maksimal {MAX_NAVBAR_CATEGORIES} kategori dapat ditampilkan di navbar.</p>
          <p>• Kategori nonaktif tidak tampil di filter publik, artikel terhubung tetap aman.</p>
          <p>• Hapus hanya jika tidak ada artikel yang menggunakan kategori tersebut.</p>
        </div>
      </AdminPageLayout>
    </>
  );
}
