import SectionHeader from "@/components/SectionHeader";
import ContributorApplyForm from "@/components/ContributorApplyForm";
import { SITE_BRAND_NAME } from "@/lib/site-config";

export const metadata = {
  title: `Daftar sebagai Kontributor | ${SITE_BRAND_NAME}`,
  description:
    `Ajukan diri sebagai kontributor ${SITE_BRAND_NAME} untuk mempublikasikan artikel di ekosistem Jepang.`,
};

export default function ContributorApplyPage() {
  return (
    <>
      <SectionHeader
        label="貢献 / KONTRIBUTOR"
        title="Daftar sebagai Kontributor"
        subtitle="Kontributor dapat mengirim artikel untuk ditinjau tim editorial. Lengkapi form di bawah untuk mengajukan permohonan."
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <ContributorApplyForm />
      </div>
    </>
  );
}
