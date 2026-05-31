"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
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

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navLinks = [
    { path: "/", label: "Beranda" },
    { path: "/articles", label: "Artikel" },
    { path: "/quizzes", label: "Kuis" },
    { path: "/polls", label: "Pool" },
    { path: "/leaderboard", label: "Peringkat" },
  ];

  const authUser = isAuthUser(user) ? user : null;

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-jepang-border"
      data-testid="main-navbar"
    >
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2"
            data-testid="navbar-logo"
          >
            <span className="font-heading font-black text-2xl tracking-tighter">
              <span className="text-jepang-red">Jepang</span>
              <span className="text-foreground">ku</span>
            </span>
            <span className="hidden md:inline-block text-xs uppercase tracking-[0.2em] font-mono text-jepang-muted border-l border-jepang-border pl-2 ml-1">
              News
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-sm font-semibold uppercase tracking-wider text-foreground hover:text-jepang-red transition-colors"
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
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
                    <PenSquare size={14} strokeWidth={1.5} /> Submit
                  </Link>
                </Button>

                <div
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-jepang-red text-white"
                  data-testid="user-points-display"
                >
                  <Award size={14} strokeWidth={1.5} />
                  <span className="text-xs font-bold font-mono">
                    {authUser.totalPoints || 0}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider">
                    PTS
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                      data-testid="user-menu-button"
                    >
                      <div className="w-9 h-9 bg-foreground text-white flex items-center justify-center font-bold text-sm border border-foreground">
                        {authUser.name?.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-60"
                    data-testid="user-dropdown-menu"
                  >
                    <DropdownMenuLabel>
                      <p className="font-semibold text-sm normal-case tracking-normal">
                        {authUser.name}
                      </p>
                      <p className="text-xs text-jepang-muted font-mono font-normal">
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
                        <User size={16} strokeWidth={1.5} /> P
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/my-articles"
                        className="cursor-pointer"
                        data-testid="menu-my-articles"
                      >
                        <FileText size={16} strokeWidth={1.5} /> Artikel Saya
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/bookmarks"
                        className="cursor-pointer"
                        data-testid="menu-bookmarks"
                      >
                        <Bookmark size={16} strokeWidth={1.5} /> Bookmark
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/points"
                        className="cursor-pointer"
                        data-testid="menu-points"
                      >
                        <Award size={16} strokeWidth={1.5} /> Riwayat Poin
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
                            <LayoutDashboard size={16} strokeWidth={1.5} />{" "}
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-jepang-red focus:text-jepang-red cursor-pointer"
                      data-testid="menu-logout"
                    >
                      <LogOut size={16} strokeWidth={1.5} /> Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : user === false ? (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  data-testid="navbar-login-btn"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button size="sm" asChild data-testid="navbar-register-btn">
                  <Link href="/register">Daftar</Link>
                </Button>
              </div>
            ) : null}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden bg-white border-t border-jepang-border"
          data-testid="mobile-menu"
        >
          <div className="px-4 py-3 space-y-2">
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
            {user === false && (
              <div className="flex gap-2 pt-3 border-t border-jepang-border">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                  data-testid="mobile-login-btn"
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Masuk
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="flex-1"
                  data-testid="mobile-register-btn"
                >
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Daftar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
