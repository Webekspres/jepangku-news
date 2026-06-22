"use client";

import { Mail } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import EmailTemplateEditor from "@/components/admin/email/EmailTemplateEditor";

export type EmailTemplateDetail = {
  templateId: string;
  label: string;
  description: string;
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  isEnabled: boolean;
  isCustomized: boolean;
  variables: { key: string; label: string; description: string }[];
};

type EmailConfigDetailClientProps = {
  detail: EmailTemplateDetail;
};

export default function EmailConfigDetailClient({ detail }: EmailConfigDetailClientProps) {
  return (
    <AdminPageLayout
      testId={`admin-email-config-${detail.templateId}`}
      label="KONFIGURASI EMAIL"
      title={
        <>
          <Mail size={32} strokeWidth={1.5} className="inline mr-2" />
          {detail.label}
        </>
      }
    >
      <EmailTemplateEditor
        templateId={detail.templateId}
        label={detail.label}
        description={detail.description}
        variables={detail.variables}
        initialForm={{
          subject: detail.subject,
          heading: detail.heading,
          bodyHtml: detail.bodyHtml,
          ctaLabel: detail.ctaLabel,
          isEnabled: detail.isEnabled,
          isCustomized: detail.isCustomized,
        }}
      />
    </AdminPageLayout>
  );
}
