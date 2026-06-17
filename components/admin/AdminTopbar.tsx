'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Menu, Bell, User, LogOut, FileText, Bookmark } from 'lucide-react';
import { useAuth, isAuthUser } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAdminBreadcrumbs } from '@/lib/admin-nav';
import UserAvatar from '@/components/media/UserAvatar';

type AdminTopbarProps = {
  onMenuClick?: () => void;
};

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const authUser = isAuthUser(user) ? user : null;
  const breadcrumbs = getAdminBreadcrumbs(pathname);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header
      className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-jepang-border bg-white px-4 lg:px-6"
      data-testid="admin-topbar"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onMenuClick}
        aria-label="Buka menu navigasi"
        data-testid="admin-mobile-menu"
      >
        <Menu size={20} />
      </Button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && (
                <ChevronRight size={14} className="shrink-0 text-jepang-muted" aria-hidden />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="truncate text-jepang-muted transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'truncate font-medium text-foreground' : 'truncate text-jepang-muted'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative text-jepang-muted hover:text-foreground"
              aria-label="Notifikasi"
              data-testid="admin-notifications-button"
            >
              <Bell size={20} strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-72" data-testid="admin-notifications-menu">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <p className="px-2 py-6 text-center text-sm text-jepang-muted">Belum ada notifikasi.</p>
          </DropdownMenuContent>
        </DropdownMenu>

        {authUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none"
                data-testid="admin-user-menu-button"
              >
                <UserAvatar
                  src={authUser.avatarUrl}
                  alt={authUser.displayName}
                  size={36}
                  fallbackInitial={authUser.displayName}
                  className="rounded-none border-foreground"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60"
              data-testid="admin-user-dropdown-menu"
            >
              <DropdownMenuLabel>
                <p className="text-sm font-semibold normal-case tracking-normal">{authUser.displayName}</p>
                <p className="font-mono text-xs font-normal text-jepang-muted">@{authUser.username}</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer" data-testid="admin-menu-profile">
                  <User size={16} strokeWidth={1.5} />
                  Profil
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/my-articles" className="cursor-pointer" data-testid="admin-menu-my-articles">
                  <FileText size={16} strokeWidth={1.5} />
                  Artikel Saya
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/bookmarks" className="cursor-pointer" data-testid="admin-menu-bookmarks">
                  <Bookmark size={16} strokeWidth={1.5} />
                  Tersimpan
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-jepang-red focus:text-jepang-red"
                data-testid="admin-menu-logout"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
