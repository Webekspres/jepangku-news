import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminPageShell({
  title,
  subtitle,
  label,
  backHref,
  backLabel = 'Kembali',
  children,
}: {
  title: string;
  subtitle?: string;
  label?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-testid="admin-page-shell">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
            >
              <ArrowLeft size={14} /> {backLabel}
            </Link>
          ) : null}
          {label ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
              {label}
            </p>
          ) : null}
          <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-jepang-muted max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
      </section>
      <div className="px-4 mx-auto max-w-7xl py-8">{children}</div>
    </div>
  );
}
