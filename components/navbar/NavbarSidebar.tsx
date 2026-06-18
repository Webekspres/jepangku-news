"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PenSquare,
  Tv,
  X,
} from "lucide-react";
import NavbarReactionLinks from "@/components/navbar/NavbarReactionLinks";
import SidebarAdSlot from "@/components/home/SidebarAdSlot";
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
  categoryArticlesHref,
} from "@/components/navbar/nav-config";
import {
  getAuthLoginPath,
  getAuthRegisterPath,
} from "@/contexts/AuthContext";
import { useAdSlot } from "@/hooks/useAdSlot";
import type { SessionUser } from "@/lib/auth/types";
import { getContributorCta } from "@/lib/contributor";
import { cn } from "@/lib/utils";

type NavbarSidebarProps = {
  open: boolean;
  onClose: () => void;
  showAuthenticated: boolean;
  showGuest: boolean;
  showAuthSkeleton: boolean;
  authUser: SessionUser | null;
  displayName: string;
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
  onLogout,
  socialLinks,
}: NavbarSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory =
    pathname === "/articles" ? searchParams.get("category") : null;

  const { data: adData, isLoading: adLoading } = useAdSlot("homepage-sidebar", {
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
                  {showAuthenticated ? (
                    <div className="space-y-1">
                      {contributorCta.disabled ? (
                        <Button
                          className="w-full"
                          disabled
                          data-testid="navbar-sidebar-contributor-cta"
                        >
                          <PenSquare size={16} strokeWidth={1.5} />
                          {contributorCta.label}
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="w-full"
                          data-testid="navbar-sidebar-contributor-cta"
                        >
                          <Link href={contributorCta.href} onClick={onClose}>
                            <PenSquare size={16} strokeWidth={1.5} />
                            {contributorCta.label}
                          </Link>
                        </Button>
                      )}
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
