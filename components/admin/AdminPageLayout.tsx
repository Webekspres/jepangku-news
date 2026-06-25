import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ADMIN_BODY_CLASS,
  ADMIN_CONTENT_CLASS,
  ADMIN_LABEL,
} from "@/lib/admin-layout";

export type AdminPageLayoutProps = {
  testId?: string;
  label?: string;
  title: React.ReactNode;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
};

export default function AdminPageLayout({
  testId,
  label = ADMIN_LABEL,
  title,
  subtitle,
  backHref,
  backLabel = "Kembali",
  headerActions,
  children,
  bodyClassName,
}: AdminPageLayoutProps) {
  return (
    <div data-testid={testId}>
      <section className="border-b border-jepang-border bg-jepang-red text-white">
        <div className={cn(ADMIN_CONTENT_CLASS, "py-10 md:py-12")}>
          {backHref ? (
            <Link
              href={backHref}
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-white/80 transition-colors hover:text-jepang-yellow"
            >
              <ArrowLeft size={14} />
              {backLabel}
            </Link>
          ) : null}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-sm text-white/80">{label}</p>
              <h1 className="font-heading font-black text-3xl tracking-tighter sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm text-white/90">{subtitle}</p>
              ) : null}
            </div>

            {headerActions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2 [&_button:hover]:border-jepang-yellow/80! [&_button:hover]:bg-jepang-yellow/80! [&_button:hover]:text-jepang-navy! [&_a:hover]:border-jepang-yellow/80! [&_a:hover]:bg-jepang-yellow/80! [&_a:hover]:text-jepang-navy!">
                {headerActions}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className={cn(ADMIN_CONTENT_CLASS, ADMIN_BODY_CLASS, bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
