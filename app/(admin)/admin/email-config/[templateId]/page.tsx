import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getEmailTemplateDefinition,
  isEmailTemplateId,
} from "@/lib/email/template-definitions";
import { getEmailTemplateConfig } from "@/lib/email/template-config";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import EmailConfigDetailClient from "./EmailConfigDetailClient";

type PageProps = {
  params: Promise<{ templateId: string }>;
};

export default async function AdminEmailConfigDetailPage({ params }: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/sign-in?redirect_url=/admin/email-config");

  const { templateId } = await params;
  if (!isEmailTemplateId(templateId)) {
    return (
      <AdminPageLayout title="Template tidak ditemukan" backHref="/admin/email-config">
        <p className="text-sm text-jepang-muted">ID template tidak valid.</p>
      </AdminPageLayout>
    );
  }

  const definition = getEmailTemplateDefinition(templateId);
  const config = await getEmailTemplateConfig(templateId);

  return (
    <EmailConfigDetailClient
      detail={{
        ...config,
        label: definition.label,
        description: definition.description,
        variables: definition.variables,
      }}
    />
  );
}
