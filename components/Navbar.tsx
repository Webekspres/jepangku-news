"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { useRouter } from "next/navigation";
import {
  useAuth,
  isAuthUser,
  getAuthLoginPath,
  getAuthRegisterPath,
} from "@/contexts/AuthContext";
import { NavbarLayerThreeSkeleton } from "@/components/navbar/NavbarSkeleton";
import NavbarSearchOverlay from "@/components/navbar/NavbarSearchOverlay";
import NavbarNotifications from "@/components/navbar/NavbarNotifications";
import NavbarCategoryBar from "@/components/navbar/NavbarCategoryBar";
import NavbarSidebar from "@/components/navbar/NavbarSidebar";
import UserAvatar from "@/components/media/UserAvatar";
import { NAV_LINKS } from "@/components/navbar/nav-config";
import { getContributorCta, canCreateArticles } from "@/lib/contributor";
import { imageLoadingProps } from "@/lib/image-loading";
import type { SocialLink } from "@/lib/site-config";
import {
  Menu,
  X,
  User,
  LogOut,
  FileText,
  Bookmark,
  Award,
  LayoutDashboard,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({ socialLinks }: { socialLinks: SocialLink[] }) {
  const { user, displayPoints, logout, loading, isLoaded, isSignedIn, clerkUser } =
    useAuth();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [layerThreeVisible, setLayerThreeVisible] = useState(true);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const layerThreeVisibleRef = useRef(true);
  const scrollAccumulator = useRef(0);
  const scrollDirection = useRef<"up" | "down" | null>(null);

  const authUser = isAuthUser(user) ? user : null;
  const showAuthSkeleton = !isLoaded || (isSignedIn && loading);
  const showGuest = isLoaded && !isSignedIn;
  const showAuthenticated = Boolean(
    authUser || (isSignedIn && !loading && clerkUser),
  );

  const displayName =
    authUser?.displayName ??
    clerkUser?.fullName ??
    clerkUser?.firstName ??
    "Akun";
  const displayUsername =
    authUser?.username ?? clerkUser?.username ?? clerkUser?.id?.slice(-8) ?? "user";
  const avatarUrl = authUser?.avatarUrl ?? clerkUser?.imageUrl ?? null;
  const totalPoints = displayPoints;
  const isAdmin = authUser?.role === "ADMIN";
  const contributorCta = getContributorCta(authUser);

  const updateLayerThreeVisible = (visible: boolean) => {
    if (layerThreeVisibleRef.current !== visible) {
      layerThreeVisibleRef.current = visible;
      setLayerThreeVisible(visible);
    }
  };

  useEffect(() => {
    const updateNavbar = () => {
      if (searchOpen || sidebarOpen) return;

      const currentY = window.scrollY || window.pageYOffset;
      const deltaY = currentY - lastScrollY.current;

      let stepDirection: "up" | "down" | null = null;
      if (deltaY > 0) stepDirection = "down";
      else if (deltaY < 0) stepDirection = "up";

      if (stepDirection !== null) {
        if (scrollDirection.current !== stepDirection) {
          scrollDirection.current = stepDirection;
          scrollAccumulator.current = deltaY;
        } else {
          scrollAccumulator.current += deltaY;
        }
      }

      const isAtTop = currentY <= 5;
      const isInTopSafeZone = currentY <= 40;

      if (isAtTop) {
        updateLayerThreeVisible(true);
      } else if (!isInTopSafeZone) {
        if (scrollDirection.current === "down" && scrollAccumulator.current > 50) {
          updateLayerThreeVisible(false);
        } else if (scrollDirection.current === "up" && scrollAccumulator.current < -50) {
          updateLayerThreeVisible(true);
        }
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateNavbar);
        ticking.current = true;
      }
    };

    updateNavbar();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [searchOpen, sidebarOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
    setSidebarOpen(false);
  };

  const openSearch = () => {
    setMobileOpen(false);
    setSidebarOpen(false);
    setSearchOpen(true);
  };

  const openSidebar = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSidebarOpen(true);
  };

  return (
    <header className="sticky top-0 z-50" data-testid="main-navbar-wrapper">
      <NavbarSearchOverlay
        open={searchOpen}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSubmit={handleSearch}
        onClose={() => setSearchOpen(false)}
      />

      <Suspense fallback={null}>
        <NavbarSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          showAuthenticated={showAuthenticated}
          showGuest={showGuest}
          showAuthSkeleton={showAuthSkeleton}
          authUser={authUser}
          displayName={displayName}
          onLogout={handleLogout}
          socialLinks={socialLinks}
        />
      </Suspense>

      <div className="relative">
        <div
          data-testid="navbar-layer-2"
          className="border-b border-jepang-border"
          style={{ backgroundColor: "var(--color-jepang-off-white)" }}
        >
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-14 items-center justify-between gap-4">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2"
                data-testid="navbar-logo"
              >
                <AssetImage
                  src="/assets/images/logo/logo-04.svg"
                  alt="Jepangku Berita"
                  width={160}
                  height={42}
                  className="h-9 w-auto"
                  {...imageLoadingProps(true)}
                />
              </Link>

              <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="whitespace-nowrap text-sm font-semibold text-jepang-navy transition-colors hover:text-jepang-orange"
                    data-testid={`nav-link-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {showAuthSkeleton ? (
                  <div
                    className="flex items-center gap-2"
                    data-testid="navbar-auth-skeleton"
                    aria-hidden
                  >
                    <div className="hidden h-8 w-20 animate-pulse rounded-lg bg-jepang-border/70 sm:block" />
                    <div className="h-9 w-9 animate-pulse rounded-full bg-jepang-border/70" />
                    <div className="h-9 w-9 animate-pulse rounded-full bg-jepang-border/70" />
                  </div>
                ) : showAuthenticated ? (
                  <>
                    <div
                      className="hidden items-center gap-2 rounded-lg bg-jepang-orange px-3 py-1.5 text-white sm:flex"
                      data-testid="user-points-display"
                    >
                      <Award size={14} strokeWidth={1.5} />
                      <span className="font-mono text-xs font-bold">{totalPoints}</span>
                      <span className="text-xs font-semibold tracking-wide">Poin</span>
                    </div>

                    <NavbarNotifications />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none"
                          data-testid="user-menu-button"
                        >
                          <UserAvatar
                            src={avatarUrl}
                            alt={displayName}
                            size={36}
                          />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-60"
                        data-testid="user-dropdown-menu"
                      >
                        <DropdownMenuLabel>
                          <p className="text-sm font-semibold normal-case tracking-normal">
                            {displayName}
                          </p>
                          <p className="font-mono text-xs font-normal text-jepang-muted">
                            @{displayUsername}
                          </p>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer" data-testid="menu-profile">
                            <User size={16} strokeWidth={1.5} />
                            Profil
                          </Link>
                        </DropdownMenuItem>

                        {canCreateArticles(authUser) ? (
                          <DropdownMenuItem asChild>
                            <Link
                              href="/my-articles"
                              className="cursor-pointer"
                              data-testid="menu-my-articles"
                            >
                              <FileText size={16} strokeWidth={1.5} />
                              Artikel Saya
                            </Link>
                          </DropdownMenuItem>
                        ) : null}

                        <DropdownMenuItem asChild>
                          <Link
                            href="/bookmarks"
                            className="cursor-pointer"
                            data-testid="menu-bookmarks"
                          >
                            <Bookmark size={16} strokeWidth={1.5} />
                            Tersimpan
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href="/activity" className="cursor-pointer" data-testid="menu-points">
                            <Award size={16} strokeWidth={1.5} />
                            Riwayat Poin
                          </Link>
                        </DropdownMenuItem>

                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin"
                                className="cursor-pointer bg-jepang-off-white"
                                data-testid="menu-admin"
                              >
                                <LayoutDashboard size={16} strokeWidth={1.5} />
                                Dasbor Admin
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="cursor-pointer text-jepang-red focus:text-jepang-red"
                          data-testid="menu-logout"
                        >
                          <LogOut size={16} strokeWidth={1.5} />
                          Keluar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : showGuest ? (
                  <>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Button variant="ghost" size="sm" asChild data-testid="navbar-login-btn">
                        <Link href={getAuthLoginPath()}>Masuk</Link>
                      </Button>
                      <Button size="sm" asChild data-testid="navbar-register-btn">
                        <Link href={getAuthRegisterPath()}>Daftar</Link>
                      </Button>
                    </div>
                  </>
                ) : null}

                <button
                  type="button"
                  className="rounded-md p-2 lg:hidden"
                  onClick={() => setMobileOpen((v) => !v)}
                  data-testid="mobile-menu-toggle"
                  aria-label="Buka menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<NavbarLayerThreeSkeleton />}>
          <NavbarCategoryBar
            visible={layerThreeVisible}
            onSearchOpen={openSearch}
            onSidebarOpen={openSidebar}
            socialLinks={socialLinks}
          />
        </Suspense>
      </div>

      {mobileOpen && (
        <div
          className="border-t border-jepang-border bg-white lg:hidden"
          data-testid="mobile-menu"
        >
          <div className="space-y-2 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold hover:text-jepang-orange"
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}

            {contributorCta.disabled ? (
              <span
                className="flex items-center gap-2 py-2 text-sm font-semibold text-jepang-muted cursor-not-allowed"
                data-testid="mobile-contributor-cta"
              >
                <PenSquare size={16} strokeWidth={1.5} />
                {contributorCta.label}
              </span>
            ) : (
              <Link
                href={contributorCta.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-jepang-orange"
                data-testid="mobile-contributor-cta"
              >
                <PenSquare size={16} strokeWidth={1.5} />
                {contributorCta.label}
              </Link>
            )}

            {showGuest && (
              <div className="flex gap-2 border-t border-jepang-border pt-3">
                <Button variant="outline" size="sm" asChild className="flex-1" data-testid="mobile-login-btn">
                  <Link href={getAuthLoginPath()} onClick={() => setMobileOpen(false)}>
                    Masuk
                  </Link>
                </Button>
                <Button size="sm" asChild className="flex-1" data-testid="mobile-register-btn">
                  <Link href={getAuthRegisterPath()} onClick={() => setMobileOpen(false)}>
                    Daftar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
