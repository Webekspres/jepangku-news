'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, isAuthUser } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut, FileText, Bookmark, Award, LayoutDashboard, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/articles', label: 'Articles' },
    { path: '/quizzes', label: 'Quiz' },
    { path: '/polls', label: 'Polls' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  const authUser = isAuthUser(user) ? user : null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E4E4E7]" data-testid="main-navbar">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <span className="font-heading font-black text-2xl tracking-tighter">
              <span className="text-[#D90429]">Jepang</span><span className="text-[#0A0A0A]">ku</span>
            </span>
            <span className="hidden md:inline-block text-xs uppercase tracking-[0.2em] font-mono text-[#52525B] border-l border-[#E4E4E7] pl-2 ml-1">
              News
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-sm font-semibold uppercase tracking-wider text-[#0A0A0A] hover:text-[#D90429] transition-colors"
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

                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#D90429] text-white" data-testid="user-points-display">
                  <Award size={14} strokeWidth={1.5} />
                  <span className="text-xs font-bold font-mono">{authUser.totalPoints || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider">PTS</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                      data-testid="user-menu-button"
                    >
                      <div className="w-9 h-9 bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-sm border border-[#0A0A0A]">
                        {authUser.name?.charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60" data-testid="user-dropdown-menu">
                    <DropdownMenuLabel>
                      <p className="font-semibold text-sm normal-case tracking-normal">{authUser.name}</p>
                      <p className="text-xs text-[#52525B] font-mono font-normal">@{authUser.username}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer" data-testid="menu-profile">
                        <User size={16} strokeWidth={1.5} /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-articles" className="cursor-pointer" data-testid="menu-my-articles">
                        <FileText size={16} strokeWidth={1.5} /> My Articles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookmarks" className="cursor-pointer" data-testid="menu-bookmarks">
                        <Bookmark size={16} strokeWidth={1.5} /> Bookmarks
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/points" className="cursor-pointer" data-testid="menu-points">
                        <Award size={16} strokeWidth={1.5} /> Points History
                      </Link>
                    </DropdownMenuItem>
                    {authUser.role === 'ADMIN' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer bg-[#F4F4F5]" data-testid="menu-admin">
                            <LayoutDashboard size={16} strokeWidth={1.5} /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-[#D90429] focus:text-[#D90429] cursor-pointer"
                      data-testid="menu-logout"
                    >
                      <LogOut size={16} strokeWidth={1.5} /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : user === false ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild data-testid="navbar-login-btn">
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild data-testid="navbar-register-btn">
                  <Link href="/register">Register</Link>
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
        <div className="md:hidden bg-white border-t border-[#E4E4E7]" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold uppercase tracking-wider hover:text-[#D90429]"
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            {user === false && (
              <div className="flex gap-2 pt-3 border-t border-[#E4E4E7]">
                <Button variant="outline" size="sm" asChild className="flex-1" data-testid="mobile-login-btn">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                </Button>
                <Button size="sm" asChild className="flex-1" data-testid="mobile-register-btn">
                  <Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
