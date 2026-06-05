import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminPageShell({
  title,
  subtitle,
  backHref = "/admin/analytics",
  backLabel = "Kembali ke Analytics",
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white min-h-screen">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
          <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-jepang-muted max-w-2xl">{subtitle}</p>
          )}
        </div>
      </section>
      <div className="px-4 mx-auto max-w-7xl py-8">{children}</div>
    </div>
  );
}
