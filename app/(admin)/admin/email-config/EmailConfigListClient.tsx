"use client";

import Link from "next/link";
import { Mail, ChevronRight } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Badge } from "@/components/ui/badge";
import type { EmailTemplateListItem } from "@/lib/email/template-config";

const CATEGORY_ORDER = ["Artikel", "Kontributor", "Akun", "Newsletter"];

type EmailConfigListClientProps = {
  templates: EmailTemplateListItem[];
};

export default function EmailConfigListClient({ templates }: EmailConfigListClientProps) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: templates.filter((t) => t.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <AdminPageLayout
      testId="admin-email-config-page"
      label="KONFIGURASI"
      title={
        <>
          <Mail size={36} strokeWidth={1.5} className="inline mr-3" />
          Konfigurasi Email
        </>
      }
      subtitle="Sesuaikan subjek, isi, dan tombol aksi untuk setiap jenis email transaksional."
    >
      <div className="space-y-8">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-jepang-muted">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {group.items.map((item) => (
                <Link
                  key={item.templateId}
                  href={`/admin/email-config/${item.templateId}`}
                  className="group block"
                >
                  <AdminCard variant="list" className="transition-colors hover:border-jepang-red">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sm">{item.label}</h3>
                          {!item.isEnabled ? (
                            <Badge variant="muted">Nonaktif</Badge>
                          ) : null}
                          {item.isCustomized ? (
                            <Badge variant="success">Kustom</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-jepang-muted line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-jepang-muted transition-transform group-hover:translate-x-0.5 group-hover:text-jepang-red"
                      />
                    </div>
                  </AdminCard>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AdminPageLayout>
  );
}
