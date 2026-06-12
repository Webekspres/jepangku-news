import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ADMIN_CONTENT_CLASS } from '@/lib/admin-layout';

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
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className={`${ADMIN_CONTENT_CLASS} py-8`}>
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-xs font-semibold text-jepang-muted hover:text-jepang-orange mb-4"
            >
              <ArrowLeft size={14} /> {backLabel}
            </Link>
          ) : null}
          {label ? (
            <p className="section-label mb-2">
              {label}
            </p>
          ) : null}
          <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tighter">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-jepang-muted max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
      </section>
      <div className={`${ADMIN_CONTENT_CLASS} py-8`}>{children}</div>
    </div>
  );
}
