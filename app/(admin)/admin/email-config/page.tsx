import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { listEmailTemplateConfigs } from "@/lib/email/template-config";
import EmailConfigListClient from "./EmailConfigListClient";

export default async function AdminEmailConfigPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/sign-in?redirect_url=/admin/email-config");

  const templates = await listEmailTemplateConfigs();

  return <EmailConfigListClient templates={templates} />;
}
