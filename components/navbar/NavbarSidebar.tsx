"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Award,
  Bookmark,
  FileText,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Tv,
  User,
  X,
} from "lucide-react";
import NavbarReactionLinks from "@/components/navbar/NavbarReactionLinks";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
import UserAvatar from "@/components/media/UserAvatar";
import type { SocialLink } from "@/lib/site-config";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { Button } from "@/components/ui/button";
import {
  MotionOverlay,
  MotionPresenceLayer,
  MotionSlidePanel,
} from "@/components/ui/motion";
import {
  NAV_CATEGORIES,
  NAV_LINKS,
  categoryArticlesHref,
} from "@/components/navbar/nav-config";
import {
  getAuthLoginPath,
  getAuthRegisterPath,
} from "@/contexts/AuthContext";
import { useAdSlot } from "@/hooks/useAdSlot";
import type { SessionUser } from "@/lib/auth/types";
import { canCreateArticles, getContributorCta } from "@/lib/contributor";
import { cn } from "@/lib/utils";

type NavbarSidebarProps = {
  open: boolean;
  onClose: () => void;
  showAuthenticated: boolean;
  showGuest: boolean;
  showAuthSkeleton: boolean;
  authUser: SessionUser | null;
  displayName: string;
  displayUsername?: string;
  avatarUrl?: string | null;
  totalPoints?: number;
  isAdmin?: boolean;
  onLogout: () => void | Promise<void>;
  socialLinks: SocialLink[];
};

export default function NavbarSidebar({
  open,
  onClose,
  showAuthenticated,
  showGuest,
  showAuthSkeleton,
  authUser,
  displayName,
  displayUsername,
  avatarUrl,
  totalPoints,
  isAdmin,
  onLogout,
  socialLinks,
}: NavbarSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory =
    pathname === "/articles" ? searchParams.get("category") : null;

  const { data: adData, isLoading: adLoading } = useAdSlot("sidebar", {
    enabled: open,
    immediate: true,
  });

  const contributorCta = getContributorCta(authUser);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div data-testid="navbar-sidebar">
      <MotionPresenceLayer open={open}>
        <MotionOverlay
          key="navbar-sidebar-backdrop"
          className="z-60 bg-black/40"
          aria-label="Tutup menu"
          onDismiss={onClose}
          data-testid="navbar-sidebar-backdrop"
        />

        <MotionSlidePanel
          key="navbar-sidebar-panel"
          className="fixed left-0 top-0 z-61 flex h-full w-[min(100vw-3rem,320px)] flex-col bg-white shadow-2xl will-change-transform"
          aria-label="Menu sidebar"
          data-testid="navbar-sidebar-panel"
        >
          <div className="flex items-center justify-between border-b border-jepang-border px-4 py-3">
            <p className="font-heading text-sm font-bold tracking-tight text-jepang-navy">
              Menu
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-jepang-navy transition-colors hover:bg-jepang-off-white"
              aria-label="Tutup sidebar"
              data-testid="navbar-sidebar-close"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="thin-scrollbar flex-1 overflow-y-auto px-4 py-4 space-y-6">
            <section>
              <p className="section-label mb-2">Menu</p>
              <ul className="space-y-0.5">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <li key={link.path}>
                      <Link
                        href={link.path}
                        onClick={onClose}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-jepang-red text-white"
                            : "text-jepang-navy hover:bg-jepang-off-white hover:text-jepang-red",
                        )}
                        data-testid={`navbar-sidebar-nav-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <p className="section-label mb-2">Reaksi</p>
              <NavbarReactionLinks variant="light" className="flex-wrap gap-1" />
            </section>

            <section>
              <p className="section-label mb-2">Video</p>
              <Link
                href="/tv"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-jepang-navy transition-colors hover:bg-jepang-off-white hover:text-jepang-red"
                data-testid="navbar-sidebar-tv"
              >
                <Tv size={16} strokeWidth={1.5} />
                Jepangku TV
              </Link>
            </section>

            <section>
              <p className="section-label mb-2">Kategori</p>
              <ul className="space-y-0.5">
                {NAV_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <li key={cat.slug}>
                      <Link
                        href={categoryArticlesHref(cat.slug)}
                        onClick={onClose}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-jepang-red text-white"
                            : "text-jepang-navy hover:bg-jepang-off-white hover:text-jepang-red",
                        )}
                        data-testid={`navbar-sidebar-category-${cat.slug}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <p className="section-label mb-2">Sosial Media</p>
              <SocialMediaLinks
                links={socialLinks}
                tone="dark"
                testIdPrefix="navbar-sidebar-social"
              />
            </section>

            <SidebarAdSlot
              data={adData}
              loading={adLoading}
              error={null}
              testId="navbar-sidebar-ad"
            />

            <section className="space-y-3 border-t border-jepang-border pt-4">
              {showAuthSkeleton ? (
                <div className="h-10 animate-pulse rounded-md bg-jepang-border/70" />
              ) : (
                <>
                  {showAuthenticated && (
                    <section className="space-y-3 lg:hidden">
                      <div className="flex items-center gap-3 rounded-xl border border-jepang-border bg-jepang-off-white/70 p-3">
                        <UserAvatar
                          src={avatarUrl ?? null}
                          alt={displayName}
                          size={44}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-jepang-navy">
                            {displayName}
                          </p>
                          {displayUsername ? (
                            <p className="truncate font-mono text-xs text-jepang-muted">
                              @{displayUsername}
                            </p>
                          ) : null}
                        </div>
                        <div
                          className="flex shrink-0 items-center gap-1 rounded-lg bg-jepang-orange px-2.5 py-1 text-white"
                          data-testid="navbar-sidebar-points"
                        >
                          <Award size={14} strokeWidth={1.5} className="shrink-0" />
                          <span className="font-mono text-xs font-bold">
                            {totalPoints ?? 0}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-0.5">
                        <li>
                          <Link
                            href="/profile"
                            onClick={onClose}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-jepang-navy transition-colors hover:bg-jepang-off-white hover:text-jepang-red"
                            data-testid="navbar-sidebar-profile"
                          >
                            <User size={16} strokeWidth={1.5} /> Profil
                          </Link>
                        </li>
                        {canCreateArticles(authUser) ? (
                          <li>
                            <Link
                              href="/my-articles"
                              onClick={onClose}
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-jepang-navy transition-colors hover:bg-jepang-off-white hover:text-jepang-red"
                              data-testid="navbar-sidebar-my-articles"
                            >
                              <FileText size={16} strokeWidth={1.5} /> Artikel Saya
                            </Link>
                          </li>
                        ) : null}
                        <li>
                          <Link
                            href="/bookmarks"
                            onClick={onClose}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-jepang-navy transition-colors hover:bg-jepang-off-white hover:text-jepang-red"
                            data-testid="navbar-sidebar-bookmarks"
                          >
                            <Bookmark size={16} strokeWidth={1.5} /> Tersimpan
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/activity"
                            onClick={onClose}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-jepang-navy transition-colors hover:bg-jepang-off-white hover:text-jepang-red"
                            data-testid="navbar-sidebar-activity"
                          >
                            <Award size={16} strokeWidth={1.5} /> Aktivitas Saya
                          </Link>
                        </li>
                        {isAdmin ? (
                          <li>
                            <Link
                              href="/admin"
                              onClick={onClose}
                              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-jepang-navy transition-colors hover:bg-jepang-off-white hover:text-jepang-red"
                              data-testid="navbar-sidebar-admin"
                            >
                              <LayoutDashboard size={16} strokeWidth={1.5} /> Dasbor Admin
                            </Link>
                          </li>
                        ) : null}
                      </ul>
                    </section>
                  )}
                  {showAuthenticated ? (
                    <div className="space-y-2">
                      {contributorCta.disabled ? (
                        <Button
                          className="w-full justify-start gap-2"
                          disabled
                          data-testid="navbar-sidebar-contributor-cta"
                        >
                          <PenSquare size={16} strokeWidth={1.5} />
                          {contributorCta.label}
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="w-full justify-start gap-2"
                          data-testid="navbar-sidebar-contributor-cta"
                        >
                          <Link href={contributorCta.href} onClick={onClose}>
                            <PenSquare size={16} strokeWidth={1.5} />
                            {contributorCta.label}
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-jepang-red hover:text-jepang-red"
                        onClick={() => {
                          onClose();
                          onLogout();
                        }}
                        data-testid="navbar-sidebar-logout"
                      >
                        <LogOut size={16} strokeWidth={1.5} />
                        Keluar
                      </Button>
                    </div>
                  ) : showGuest ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={getAuthLoginPath()} onClick={onClose}>
                          Masuk
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={getAuthRegisterPath()} onClick={onClose}>
                          Daftar
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </MotionSlidePanel>
      </MotionPresenceLayer>
    </div>
  );
}
