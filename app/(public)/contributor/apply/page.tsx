import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "Daftar sebagai Kontributor | Jepangku",
  description:
    "Ajukan diri sebagai kontributor Jepangku untuk mempublikasikan artikel di portal berita.",
};

export default function ContributorApplyPage() {
  return (
    <>
      <SectionHeader
        label="貢献 / KONTRIBUTOR"
        title="Daftar sebagai Kontributor"
        subtitle="Form pendaftaran kontributor dan antrian persetujuan admin akan segera tersedia. Sementara, buat akun Jepangku terlebih dahulu."
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mx-auto max-w-lg rounded-lg border border-jepang-border bg-white p-8 shadow-jepang text-center">
          <p className="text-sm text-jepang-muted leading-relaxed mb-6">
            Kontributor dapat mengirim artikel untuk ditinjau tim editorial. User
            biasa tidak dapat mengunggah artikel hingga permohonan kontributor
            disetujui.
          </p>
          <Link href="/sign-up" className="jepang-btn-primary inline-flex">
            Buat Akun Jepangku
          </Link>
        </div>
      </div>
    </>
  );
}
