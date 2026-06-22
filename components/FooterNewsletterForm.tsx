"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FooterNewsletterFormProps = {
  defaultEmail?: string;
};

export default function FooterNewsletterForm({ defaultEmail = "" }: FooterNewsletterFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Masukkan alamat email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal berlangganan");
        return;
      }
      setSubmitted(true);
      toast.success(data.message ?? "Terima kasih sudah berlangganan!");
    } catch {
      toast.error("Gagal berlangganan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-sm text-zinc-300 leading-relaxed" data-testid="newsletter-success">
        Terima kasih! Periksa inbox Anda untuk konfirmasi langganan newsletter.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3" data-testid="newsletter-form">
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email@contoh.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          required
          className="min-w-0 border-white/25 bg-white py-2.5 text-sm text-jepang-navy placeholder:text-zinc-400 focus:border-white focus:ring-jepang-orange/40"
          data-testid="newsletter-email-input"
        />
        <Button
          type="submit"
          disabled={submitting}
          className="bg-jepang-orange text-white hover:bg-jepang-orange/90"
          data-testid="newsletter-submit"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />
              Mengirim…
            </>
          ) : (
            "Langganan"
          )}
        </Button>
      </div>
    </form>
  );
}
