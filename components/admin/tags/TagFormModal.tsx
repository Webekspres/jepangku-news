"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type TagFormValues = {
  name: string;
};

type TagFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: TagFormValues;
  saving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TagFormValues) => void;
};

export default function TagFormModal({
  open,
  mode,
  initialValues,
  saving = false,
  onOpenChange,
  onSubmit,
}: TagFormModalProps) {
  const [form, setForm] = useState<TagFormValues>(initialValues);

  useEffect(() => {
    if (open) setForm(initialValues);
  }, [open, initialValues]);

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
          data-testid={mode === "create" ? "create-tag-modal" : "edit-tag-modal"}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-3 border-b border-jepang-border px-5 py-4">
              <div>
                <DialogTitle className="font-heading text-lg font-bold text-jepang-navy">
                  {mode === "create" ? "Tambah Tag" : "Edit Tag"}
                </DialogTitle>
                <p className="mt-1 text-sm text-jepang-muted">
                  {mode === "create"
                    ? "Buat tag artikel baru"
                    : "Perbarui nama tag"}
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

            <div className="px-5 py-4">
              <Label htmlFor="tag-name" className="text-xs uppercase tracking-wider">
                Nama <span className="text-jepang-red">*</span>
              </Label>
              <Input
                id="tag-name"
                type="text"
                placeholder="contoh: tokyo, sushi, anime"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1.5"
                data-testid="tag-name-input"
              />
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
