import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Plus,
  LayoutGrid,
  Tag,
  Home,
  FileType,
  MessageSquare,
  Zap,
  BarChart3,
  Users,
  Trophy,
  Coins,
  ScrollText,
  Tv,
} from 'lucide-react';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Ditampilkan tetapi belum tersedia (Fase E) */
  comingSoon?: boolean;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Utama',
    items: [{ href: '/admin', label: 'Dasbor', icon: LayoutDashboard, exact: true }],
  },
  {
    id: 'content',
    label: 'Konten',
    items: [
      { href: '/admin/articles', label: 'Semua Artikel', icon: FileText },
      { href: '/admin/articles/review', label: 'Review Artikel', icon: CheckSquare },
      { href: '/admin/articles/create', label: 'Buat Artikel', icon: Plus },
      { href: '/admin/categories', label: 'Kategori', icon: LayoutGrid },
      { href: '/admin/tags', label: 'Tag', icon: Tag },
      { href: '/admin/homepage', label: 'Pengaturan Beranda', icon: Home },
      { href: '/admin/info-pages', label: 'Halaman Informasi', icon: FileType },
      { href: '/admin/videos', label: 'Jepangku TV', icon: Tv },
      { href: '/admin/comments', label: 'Moderasi Komentar', icon: MessageSquare },
    ],
  },
  {
    id: 'interactive',
    label: 'Interaktif',
    items: [
      { href: '/admin/quizzes', label: 'Kuis', icon: Zap },
      { href: '/admin/polls', label: 'Polling', icon: MessageSquare },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { href: '/admin/analytics', label: 'Ringkasan', icon: BarChart3, exact: true },
      { href: '/admin/analytics/content', label: 'Performa Artikel', icon: FileText },
      { href: '/admin/analytics/categories', label: 'Per Kategori', icon: LayoutGrid },
    ],
  },
  {
    id: 'users',
    label: 'Pengguna',
    items: [{ href: '/admin/users', label: 'Kelola Pengguna', icon: Users }],
  },
  {
    id: 'system',
    label: 'Sistem',
    items: [
      {
        href: '/admin/leaderboard',
        label: 'Monitor Leaderboard',
        icon: Trophy,
        comingSoon: true,
      },
      {
        href: '/admin/points',
        label: 'Transaksi Poin',
        icon: Coins,
        comingSoon: true,
      },
      {
        href: '/admin/activity-log',
        label: 'Audit Log',
        icon: ScrollText,
        comingSoon: true,
      },
    ],
  },
];

export function isAdminNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact || href === '/admin') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type AdminBreadcrumb = {
  href?: string;
  label: string;
};

/** Semua item nav (flat) untuk breadcrumb */
function getAllNavItems(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((g) => g.items);
}

function getSubPageLabel(pathname: string, baseHref: string): string {
  const rest = pathname.slice(baseHref.length).replace(/^\//, '');
  if (!rest) return '';
  if (rest === 'create') return 'Buat Baru';
  if (rest.endsWith('/edit') || rest === 'edit') return 'Edit';
  if (/^[0-9a-f-]{36}$/i.test(rest.split('/')[0] ?? '')) return 'Detail';
  return 'Detail';
}

/** Breadcrumb admin dari pathname — independen dari navbar publik */
export function getAdminBreadcrumbs(pathname: string): AdminBreadcrumb[] {
  if (pathname === '/admin') {
    return [{ label: 'Dasboard' }];
  }

  let best: AdminNavItem | null = null;
  for (const item of getAllNavItems()) {
    if (item.comingSoon) continue;
    const matches =
      pathname === item.href ||
      (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
    if (matches && (!best || item.href.length > best.href.length)) {
      best = item;
    }
  }

  if (!best) {
    return [{ href: '/admin', label: 'Admin' }, { label: 'Halaman' }];
  }

  const crumbs: AdminBreadcrumb[] = [
    { href: '/admin', label: 'Admin' },
    { href: best.href, label: best.label },
  ];

  if (pathname !== best.href) {
    crumbs.push({ label: getSubPageLabel(pathname, best.href) });
  }

  return crumbs;
}
