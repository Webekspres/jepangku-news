'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AssetImage from '@/components/AssetImage';
import { imageLoadingProps } from '@/lib/image-loading';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THIN_SCROLLBAR_CLASS } from '@/components/ui/thin-scrollbar';
import { Input } from '@/components/ui/input';
import { ADMIN_NAV_GROUPS, getActiveAdminNavHref, type AdminNavGroup } from '@/lib/admin-nav';

type AdminSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

function filterNavGroups(groups: AdminNavGroup[], query: string): AdminNavGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
    }))
    .filter((group) => group.items.length > 0);
}

export default function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  const filteredGroups = useMemo(() => filterNavGroups(ADMIN_NAV_GROUPS, search), [search]);
  const activeHref = useMemo(() => getActiveAdminNavHref(pathname), [pathname]);

  return (
    <aside
      className={cn('flex h-full min-h-0 w-64 shrink-0 flex-col border-r border-jepang-border bg-white', className)}
      data-testid="admin-sidebar"
    >
      {/* Brand — seperti NextUI dashboard sidebar header */}
      <div className="shrink-0 border-b border-jepang-border px-4 py-5 flex flex-col items-center justify-center">
        <Link href="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <AssetImage
            src="/assets/images/logo/Logo-04.svg"
            alt="Jepangku"
            width={120}
            height={40}
            className="h-8 w-auto"
            {...imageLoadingProps(false)}
          />
        </Link>
      </div>

      {/* Search navigasi */}
      <div className="shrink-0 px-3 py-4">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted"
          />
          <Input
            type="search"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 border-jepang-border bg-zinc-50 pl-9 text-sm focus-visible:ring-jepang-red/30"
            data-testid="admin-sidebar-search"
          />
        </div>
      </div>

      {/* Nav groups */}
      <nav
        className={cn(THIN_SCROLLBAR_CLASS, 'min-h-0 flex-1 overflow-y-auto px-3 pb-4')}
        aria-label="Navigasi admin"
      >
        {filteredGroups.length === 0 ? (
          <p className="px-3 py-2 text-sm text-jepang-muted">Menu tidak ditemukan.</p>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-jepang-muted">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = !item.comingSoon && item.href === activeHref;

                  if (item.comingSoon) {
                    return (
                      <li key={item.href}>
                        <span
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-jepang-muted/50 cursor-not-allowed"
                          title="Segera — Fase E"
                        >
                          <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                          <span className="ml-auto rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                            soon
                          </span>
                        </span>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-jepang-red/10 font-medium text-jepang-red'
                            : 'text-foreground hover:bg-zinc-100',
                        )}
                        data-testid={`admin-nav-${group.id}-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          className={cn('shrink-0', active ? 'text-jepang-red' : 'text-jepang-muted')}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>

      <div className="shrink-0 border-t border-jepang-border p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-center rounded-lg border border-jepang-border px-3 py-2 text-xs font-medium text-jepang-muted transition-colors hover:border-foreground hover:text-foreground"
          data-testid="admin-back-to-portal"
        >
          Ke Portal Publik
        </Link>
      </div>
    </aside>
  );
}
