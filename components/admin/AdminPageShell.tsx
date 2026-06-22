import AdminPageLayout from "@/components/admin/AdminPageLayout";

export default function AdminPageShell({
  title,
  subtitle,
  label,
  backHref,
  backLabel = "Kembali",
  children,
  testId,
}: {
  title: string;
  subtitle?: string;
  label?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <AdminPageLayout
      testId={testId ?? "admin-page-shell"}
      title={title}
      subtitle={subtitle}
      label={label}
      backHref={backHref}
      backLabel={backLabel}
    >
      {children}
    </AdminPageLayout>
  );
}
