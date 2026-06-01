"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminCreatePoll() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    poll_type: "POLLING",
    thumbnail_url: "",
    status: "ACTIVE",
  });

  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    if (options.some((o) => !o.trim())) {
      toast.error("Semua opsi wajib diisi");
      return;
    }

    if (options.length < 2) {
      toast.error("Minimal harus ada 2 opsi");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, options }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }

      toast.success("Polling berhasil dibuat");
      router.push("/admin");
    } catch (e: any) {
      toast.error(e.message || "Gagal membuat polling");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-create-poll-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>

          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Buat Polling / Voting
          </h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8 space-y-6">
        <div className="space-y-2">
          <Label>Tipe</Label>

          <div className="flex gap-2">
            <Button
              variant={form.poll_type === "POLLING" ? "black" : "outline"}
              size="sm"
              onClick={() => setForm({ ...form, poll_type: "POLLING" })}
              data-testid="type-polling"
            >
              Polling
            </Button>

            <Button
              variant={form.poll_type === "VOTING" ? "default" : "outline"}
              size="sm"
              onClick={() => setForm({ ...form, poll_type: "VOTING" })}
              data-testid="type-voting"
            >
              Voting
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Judul / Pertanyaan *</Label>

          <Input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            data-testid="poll-title-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>

          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            data-testid="poll-description-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>

          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v })}
          >
            <SelectTrigger data-testid="poll-status-select">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="CLOSED">Ditutup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Opsi Jawaban</Label>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOptions([...options, ""])}
              className="text-jepang-red hover:text-jepang-red"
              data-testid="add-option-btn"
            >
              <Plus size={12} /> Tambah Opsi
            </Button>
          </div>

          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono font-bold text-jepang-muted self-center w-8">
                  {String.fromCharCode(65 + idx)}.
                </span>

                <Input
                  type="text"
                  className="flex-1"
                  placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => {
                    const o = [...options];
                    o[idx] = e.target.value;
                    setOptions(o);
                  }}
                  data-testid={`option-input-${idx}`}
                />

                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setOptions(options.filter((_, i) => i !== idx))
                    }
                    className="text-jepang-red"
                    data-testid={`remove-option-${idx}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-jepang-border">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            data-testid="create-poll-submit"
          >
            {loading ? "Membuat..." : "Buat Polling"}
          </Button>
        </div>
      </div>
    </div>
  );
}
