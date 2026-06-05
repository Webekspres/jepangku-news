"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, LayoutGrid, Zap, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/analytics", label: "Ringkasan", icon: BarChart3, exact: true },
  { href: "/admin/analytics/content", label: "Performa Artikel", icon: FileText },
  { href: "/admin/analytics/categories", label: "Per Kategori", icon: LayoutGrid },
];

export default function AnalyticsNav({
  extra,
}: {
  extra?: { href: string; label: string; icon?: typeof Zap };
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-jepang-border pb-4 mb-8"
      data-testid="analytics-nav"
      aria-label="Navigasi analytics"
    >
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors",
              active
                ? "border-foreground bg-foreground text-white"
                : "border-jepang-border text-jepang-muted hover:border-foreground hover:text-foreground",
            )}
          >
            <Icon size={12} strokeWidth={1.5} />
            {link.label}
          </Link>
        );
      })}
      {extra && (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-jepang-red bg-jepang-red/5 text-jepang-red"
        >
          {extra.icon && <extra.icon size={12} strokeWidth={1.5} />}
          {extra.label}
        </span>
      )}
    </nav>
  );
}
