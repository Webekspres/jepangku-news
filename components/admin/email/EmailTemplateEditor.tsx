"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, RotateCcw, Save } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EmailVariable = {
  key: string;
  label: string;
  description: string;
};

type EmailTemplateEditorProps = {
  templateId: string;
  label: string;
  description: string;
  variables: EmailVariable[];
  initialForm: {
    subject: string;
    heading: string;
    bodyHtml: string;
    ctaLabel: string;
    isEnabled: boolean;
    isCustomized: boolean;
  };
};

type FormState = {
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  isEnabled: boolean;
};

export default function EmailTemplateEditor({
  templateId,
  label,
  description,
  variables,
  initialForm,
}: EmailTemplateEditorProps) {
  const [form, setForm] = useState<FormState>({
    subject: initialForm.subject,
    heading: initialForm.heading,
    bodyHtml: initialForm.bodyHtml,
    ctaLabel: initialForm.ctaLabel,
    isEnabled: initialForm.isEnabled,
  });
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isCustomized, setIsCustomized] = useState(initialForm.isCustomized);

  const fetchPreview = useCallback(async (nextForm: FormState) => {
    if (
      !nextForm.subject.trim() ||
      !nextForm.heading.trim() ||
      !nextForm.bodyHtml.trim() ||
      !nextForm.ctaLabel.trim()
    ) {
      setPreviewHtml("");
      setPreviewSubject("");
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${templateId}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextForm),
      });
      if (!res.ok) throw new Error("Preview gagal");
      const data = await res.json();
      setPreviewHtml(data.html ?? "");
      setPreviewSubject(data.subject ?? "");
    } catch {
      setPreviewHtml("");
      setPreviewSubject("");
    } finally {
      setPreviewLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPreview(form);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form, fetchPreview]);

  const copyVariable = async (key: string) => {
    const token = `{{${key}}}`;
    try {
      await navigator.clipboard.writeText(token);
      toast.success(`Disalin: ${token}`);
    } catch {
      toast.error("Gagal menyalin variabel");
    }
  };

  const handleSave = async () => {
    if (!form.subject.trim() || !form.heading.trim() || !form.bodyHtml.trim() || !form.ctaLabel.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan");
      }
      setIsCustomized(true);
      toast.success("Template email disimpan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal reset");
      const data = await res.json();
      setForm({
        subject: data.subject,
        heading: data.heading,
        bodyHtml: data.bodyHtml,
        ctaLabel: data.ctaLabel,
        isEnabled: data.isEnabled,
      });
      setIsCustomized(false);
      toast.success("Template dikembalikan ke default");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal reset");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-jepang-muted">{description}</p>
          {isCustomized ? (
            <Badge variant="success" className="mt-2">
              Kustom
            </Badge>
          ) : (
            <Badge variant="muted" className="mt-2">
              Default sistem
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-jepang-border px-3 py-2">
            <Label htmlFor="email-enabled" className="text-sm">
              Aktif
            </Label>
            <Switch
              id="email-enabled"
              checked={form.isEnabled}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, isEnabled: checked }))}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleReset()}
            disabled={resetting || !isCustomized}
          >
            <RotateCcw size={14} className="mr-1" />
            Reset default
          </Button>
          <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>
            <Save size={14} className="mr-1" />
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <AdminCard title="Variabel dinamis" variant="list">
        <p className="mb-3 text-sm text-jepang-muted">
          Klik variabel untuk menyalin token ke clipboard. Tempel ke subjek, judul, isi, atau label
          tombol.
        </p>
        <div className="flex flex-wrap gap-2">
          {variables.map((variable) => (
            <button
              key={variable.key}
              type="button"
              onClick={() => void copyVariable(variable.key)}
              className="group rounded-lg border border-jepang-border bg-jepang-off-white px-3 py-2 text-left transition-colors hover:border-jepang-red"
              title={variable.description}
            >
              <span className="flex items-center gap-1.5 font-mono text-xs text-jepang-red">
                {`{{${variable.key}}}`}
                <Copy size={12} className="opacity-50 group-hover:opacity-100" />
              </span>
              <span className="mt-0.5 block text-xs font-medium">{variable.label}</span>
            </button>
          ))}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <AdminCard title={`Edit — ${label}`} variant="list">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-subject">Subjek email</Label>
                <Input
                  id="email-subject"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="mt-1.5"
                  placeholder="Subjek dengan {{variabel}}"
                />
              </div>
              <div>
                <Label htmlFor="email-heading">Judul di dalam email</Label>
                <Input
                  id="email-heading"
                  value={form.heading}
                  onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Isi email</Label>
                <div className="mt-1.5">
                  <RichTextEditor
                    value={form.bodyHtml}
                    onChange={(html) => setForm((f) => ({ ...f, bodyHtml: html }))}
                    placeholder="Tulis isi email..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email-cta">Label tombol aksi</Label>
                <Input
                  id="email-cta"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-3">
          <AdminCard title="Preview email" variant="list" className="h-full">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {previewSubject || "Subjek preview..."}
              </p>
              {previewLoading ? (
                <span className="inline-flex items-center gap-1 text-xs text-jepang-muted">
                  <Loader2 size={12} className="animate-spin" />
                  Memuat...
                </span>
              ) : previewHtml ? (
                <span className="shrink-0 text-xs text-jepang-muted">Hanya preview</span>
              ) : null}
            </div>
            <div
              className={cn(
                "overflow-hidden rounded-lg border border-jepang-border bg-[#f5f5f7]",
                !previewHtml && "min-h-[420px] flex items-center justify-center",
              )}
            >
              {previewHtml ? (
                <iframe
                  title={`Preview email ${label}`}
                  srcDoc={previewHtml}
                  className="h-[min(70vh,640px)] w-full border-0 bg-white"
                  sandbox=""
                  tabIndex={-1}
                />
              ) : (
                <p className="px-4 text-sm text-jepang-muted">
                  Isi form untuk melihat preview.
                </p>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
