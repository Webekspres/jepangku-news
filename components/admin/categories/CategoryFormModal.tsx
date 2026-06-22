"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { MAX_NAVBAR_CATEGORIES } from "@/lib/categories/constants";
import { cn } from "@/lib/utils";

export type CategoryFormValues = {
  name: string;
  description: string;
  showInNavbar: boolean;
};

type CategoryFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: CategoryFormValues;
  navbarCount: number;
  saving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => void;
};

export default function CategoryFormModal({
  open,
  mode,
  initialValues,
  navbarCount,
  saving = false,
  onOpenChange,
  onSubmit,
}: CategoryFormModalProps) {
  const [form, setForm] = useState<CategoryFormValues>(initialValues);

  useEffect(() => {
    if (open) setForm(initialValues);
  }, [open, initialValues]);

  const navbarFull = navbarCount >= MAX_NAVBAR_CATEGORIES;
  const navbarToggleDisabled =
    navbarFull && !form.showInNavbar && !initialValues.showInNavbar;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal open={open}>
        <DialogOverlay />
        <DialogContent
          className={cn(
            "w-[min(100vw-2rem,28rem)] rounded-lg border border-jepang-border bg-white shadow-jepang-lg",
          )}
          data-testid={mode === "create" ? "create-category-modal" : "edit-category-modal"}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-3 border-b border-jepang-border px-5 py-4">
              <div>
                <DialogTitle className="font-heading text-lg font-bold text-jepang-navy">
                  {mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
                </DialogTitle>
                <p className="mt-1 text-sm text-jepang-muted">
                  {mode === "create"
                    ? "Buat kategori artikel baru"
                    : "Perbarui nama dan visibilitas kategori"}
                </p>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="rounded-md p-1.5 text-jepang-muted hover:bg-jepang-off-white"
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </DialogClose>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div>
                <Label htmlFor="category-name" className="text-xs uppercase tracking-wider">
                  Nama <span className="text-jepang-red">*</span>
                </Label>
                <Input
                  id="category-name"
                  type="text"
                  placeholder="contoh: Anime, Budaya, Wisata"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1.5"
                  data-testid="category-name-input"
                />
              </div>

              <div>
                <Label htmlFor="category-description" className="text-xs uppercase tracking-wider">
                  Deskripsi
                </Label>
                <Input
                  id="category-description"
                  type="text"
                  placeholder="Deskripsi singkat kategori"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1.5"
                  data-testid="category-description-input"
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-jepang-border bg-jepang-off-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Tampil di navbar</p>
                  <p className="text-xs text-jepang-muted mt-0.5">
                    Maks {MAX_NAVBAR_CATEGORIES} kategori ({navbarCount}/{MAX_NAVBAR_CATEGORIES} terpakai)
                  </p>
                </div>
                <Switch
                  checked={form.showInNavbar}
                  disabled={navbarToggleDisabled}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, showInNavbar: checked }))
                  }
                  data-testid="category-navbar-toggle"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-jepang-border px-5 py-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={saving || !form.name.trim()}>
                <Check size={14} className="mr-1" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
