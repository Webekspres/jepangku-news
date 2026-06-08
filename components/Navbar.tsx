"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, isAuthUser, getAuthLoginPath, getAuthRegisterPath } from "@/contexts/AuthContext";
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
  Search,
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

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [topVisible, setTopVisible] = useState(true);
  const [bottomVisible, setBottomVisible] = useState(true);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const authUser = isAuthUser(user) ? user : null;

  const topVisibleRef = useRef(true);
  const bottomVisibleRef = useRef(true);
  const scrollAccumulator = useRef(0);
  const scrollDirection = useRef<"up" | "down" | null>(null);

  const updateTopVisible = (visible: boolean) => {
    if (topVisibleRef.current !== visible) {
      topVisibleRef.current = visible;
      setTopVisible(visible);
    }
  };

  const updateBottomVisible = (visible: boolean) => {
    if (bottomVisibleRef.current !== visible) {
      bottomVisibleRef.current = visible;
      setBottomVisible(visible);
    }
  };

  const navLinks = [
    { path: "/", label: "Beranda" },
    { path: "/articles", label: "Artikel" },
    { path: "/explore", label: "Jelajahi" },
    { path: "/quizzes", label: "Kuis" },
    { path: "/polls", label: "Polling" },
    { path: "/leaderboard", label: "Peringkat" },
  ];

  useEffect(() => {
    const updateNavbar = () => {
      const currentY = window.scrollY || window.pageYOffset;
      const deltaY = currentY - lastScrollY.current;

      // Determine step direction
      let stepDirection: "up" | "down" | null = null;
      if (deltaY > 0) {
        stepDirection = "down";
      } else if (deltaY < 0) {
        stepDirection = "up";
      }

      // Accumulate scroll distance in the same direction
      if (stepDirection !== null) {
        if (scrollDirection.current !== stepDirection) {
          scrollDirection.current = stepDirection;
          scrollAccumulator.current = deltaY;
        } else {
          scrollAccumulator.current += deltaY;
        }
      }

      // 1. Hysteresis for Top Spacer (black bar, height ~20px)
      if (topVisibleRef.current) {
        if (currentY > 40) {
          updateTopVisible(false);
        }
      } else {
        if (currentY <= 5) {
          updateTopVisible(true);
        }
      }

      // 2. Cumulative Hysteresis/Buffer for Bottom Spacer (red bar, height ~40px)
      const isAtTop = currentY <= 5;
      const isInTopSafeZone = currentY <= 40;

      if (isAtTop) {
        updateBottomVisible(true);
      } else if (!isInTopSafeZone) {
        // We use a 50px threshold. Since the bottom spacer height change is 40px,
        // this 50px threshold is larger than the layout shift, completely breaking
        // any infinite vibration/jitter loops.
        if (scrollDirection.current === "down" && scrollAccumulator.current > 50) {
          updateBottomVisible(false);
        } else if (scrollDirection.current === "up" && scrollAccumulator.current < -50) {
          updateBottomVisible(true);
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

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
  };

  return (
    <header className="sticky top-0 z-50" data-testid="main-navbar-wrapper">
      <div
        data-testid="header-top-spacer"
        className={`w-full overflow-hidden transition-all duration-300 ease-out ${
          topVisible ? "h-7 opacity-100" : "h-0 opacity-0"
        }`}
        style={{ backgroundColor: "var(--color-jepang-black)" }}
      />

      <div
        data-testid="main-navbar"
        className="relative z-10"
        style={{ backgroundColor: "var(--color-jepang-off-white)" }}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2"
              data-testid="navbar-logo"
            >
              <Image
                src="/assets/images/logo/Logo-03.svg"
                alt="Jepangku Berita"
                width={140}
                height={48}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:text-jepang-red"
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen((value) => !value)}
                className="p-2 text-foreground transition-colors hover:text-jepang-red"
                aria-label="Cari artikel"
                data-testid="navbar-search-btn"
              >
                {searchOpen ? (
                  <X size={18} strokeWidth={1.5} />
                ) : (
                  <Search size={18} strokeWidth={1.5} />
                )}
              </button>

              {authUser ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hidden md:inline-flex"
                    data-testid="navbar-submit-article"
                  >
                    <Link href="/submit-article">
                      <PenSquare size={14} strokeWidth={1.5} />
                      Buat Artikel
                    </Link>
                  </Button>

                  <div
                    className="hidden items-center gap-2 bg-jepang-red px-3 py-2 text-white md:flex"
                    data-testid="user-points-display"
                  >
                    <Award size={14} strokeWidth={1.5} />

                    <span className="font-mono text-xs font-bold">
                      {authUser.totalPoints || 0}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider">
                      POIN
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none"
                        data-testid="user-menu-button"
                      >
                        {authUser.avatarUrl ? (
                          <img
                            src={authUser.avatarUrl}
                            alt={authUser.name}
                            className="h-9 w-9 border border-foreground object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center border border-foreground bg-foreground text-sm font-bold text-white">
                            {authUser.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-60"
                      data-testid="user-dropdown-menu"
                    >
                      <DropdownMenuLabel>
                        <p className="text-sm font-semibold normal-case tracking-normal">
                          {authUser.name}
                        </p>
                        <p className="font-mono text-xs font-normal text-jepang-muted">
                          @{authUser.username}
                        </p>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          className="cursor-pointer"
                          data-testid="menu-profile"
                        >
                          <User size={16} strokeWidth={1.5} />
                          Profil
                        </Link>
                      </DropdownMenuItem>

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
                        <Link
                          href="/points"
                          className="cursor-pointer"
                          data-testid="menu-points"
                        >
                          <Award size={16} strokeWidth={1.5} />
                          Riwayat Poin
                        </Link>
                      </DropdownMenuItem>

                      {authUser.role === "ADMIN" && (
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
              ) : !loading && user === false ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    data-testid="navbar-login-btn"
                  >
                    <Link href={getAuthLoginPath()}>Masuk</Link>
                  </Button>

                  <Button size="sm" asChild data-testid="navbar-register-btn">
                    <Link href={getAuthRegisterPath()}>Daftar</Link>
                  </Button>
                </div>
              ) : null}

              <button
                className="p-2 md:hidden"
                onClick={() => setMobileOpen((value) => !value)}
                data-testid="mobile-menu-toggle"
                aria-label="Buka menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div
          className="border-t border-jepang-border bg-white px-4 py-3"
          data-testid="navbar-search-bar"
        >
          <form onSubmit={handleSearch} className="mx-auto flex max-w-7xl gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Cari artikel, topik, atau tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-jepang-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
              data-testid="navbar-search-input"
            />

            <button
              type="submit"
              className="bg-jepang-red px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-jepang-red-hover"
              data-testid="navbar-search-submit"
            >
              Cari
            </button>
          </form>
        </div>
      )}

      <div
        data-testid="header-bottom-spacer"
        className={`w-full overflow-hidden transition-all duration-500 ease-out ${
          bottomVisible ? "h-10 opacity-100" : "h-0 opacity-0"
        }`}
        style={{ backgroundColor: "var(--color-jepang-red)" }}
      />

      {mobileOpen && (
        <div
          className="border-t border-jepang-border bg-white md:hidden"
          data-testid="mobile-menu"
        >
          <div className="space-y-2 px-4 py-3">
            <form
              onSubmit={handleSearch}
              className="flex gap-2 border-b border-jepang-border pb-3"
            >
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-jepang-border bg-white px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                data-testid="mobile-search-input"
              />

              <button
                type="submit"
                className="bg-jepang-red px-3 py-2 text-white"
                aria-label="Cari"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red"
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user === false && (
              <div className="flex gap-2 border-t border-jepang-border pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                  data-testid="mobile-login-btn"
                >
                  <Link href={getAuthLoginPath()} onClick={() => setMobileOpen(false)}>
                    Masuk
                  </Link>
                </Button>

                <Button
                  size="sm"
                  asChild
                  className="flex-1"
                  data-testid="mobile-register-btn"
                >
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