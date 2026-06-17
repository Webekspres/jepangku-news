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
  UserPlus,
  Trophy,
  Coins,
  ScrollText,
  Tv,
  Megaphone,
  Share2,
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
      { href: '/admin/social-links', label: 'Sosial Media', icon: Share2 },
      { href: '/admin/info-pages', label: 'Halaman Informasi', icon: FileType },
      { href: '/admin/videos', label: 'Jepangku TV', icon: Tv },
      { href: '/admin/ads', label: 'Banner & Iklan', icon: Megaphone },
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
    items: [
      { href: '/admin/users', label: 'Kelola Pengguna', icon: Users },
      { href: '/admin/contributors', label: 'Permohonan Kontributor', icon: UserPlus },
    ],
  },
  {
    id: 'system',
    label: 'Sistem',
    items: [
      {
        href: '/admin/leaderboard',
        label: 'Monitor Leaderboard',
        icon: Trophy,
      },
      {
        href: '/admin/points',
        label: 'Transaksi Poin',
        icon: Coins,
      },
      {
        href: '/admin/activity-log',
        label: 'Audit Log',
        icon: ScrollText,
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

/** Semua item nav (flat) */
function getAllNavItems(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((g) => g.items);
}

/** Href menu yang paling spesifik cocok dengan pathname (hindari /admin/articles aktif di /review). */
export function getActiveAdminNavHref(pathname: string): string | null {
  let best: AdminNavItem | null = null;

  for (const item of getAllNavItems()) {
    if (item.comingSoon) continue;
    if (!isAdminNavActive(pathname, item.href, item.exact)) continue;
    if (!best || item.href.length > best.href.length) {
      best = item;
    }
  }

  return best?.href ?? null;
}

export type AdminBreadcrumb = {
  href?: string;
  label: string;
};

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

  const activeHref = getActiveAdminNavHref(pathname);
  const best = activeHref
    ? getAllNavItems().find((item) => item.href === activeHref) ?? null
    : null;

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
