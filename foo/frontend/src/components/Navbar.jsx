import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, User, LogOut, FileText, Bookmark, Award, LayoutDashboard, PenSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/articles', label: 'Articles' },
    { path: '/quizzes', label: 'Quiz' },
    { path: '/polls', label: 'Polls' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-jepang-border" data-testid="main-navbar">
      <div className="px-4 md:px-8 lg:px-12 mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
            <span className="font-heading font-black text-2xl tracking-tighter">
              <span className="text-jepang-red">Jepang</span><span className="text-jepang-black">ku</span>
            </span>
            <span className="hidden md:inline-block text-xs uppercase tracking-[0.2em] font-mono text-jepang-muted border-l border-jepang-border pl-2 ml-1">
              News
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-semibold uppercase tracking-wider text-jepang-black hover:text-jepang-red transition-colors"
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user && user !== false ? (
              <>
                <Link to="/submit-article" className="hidden md:inline-flex items-center gap-2 px-3 py-2 border border-jepang-black text-xs uppercase tracking-wider font-bold hover:bg-jepang-black hover:text-white transition-colors" data-testid="navbar-submit-article">
                  <PenSquare size={14} strokeWidth={1.5} /> Submit
                </Link>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-jepang-red text-white" data-testid="user-points-display">
                  <Award size={14} strokeWidth={1.5} />
                  <span className="text-xs font-bold font-mono">{user.total_points || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider">PTS</span>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    data-testid="user-menu-button"
                  >
                    <div className="w-9 h-9 bg-jepang-black text-white flex items-center justify-center font-bold text-sm border border-jepang-black">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-jepang-black z-20 hard-shadow" data-testid="user-dropdown-menu">
                        <div className="px-4 py-3 border-b border-jepang-border bg-jepang-off-white">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-jepang-muted font-mono">@{user.username}</p>
                        </div>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-jepang-off-white transition-colors" data-testid="menu-profile">
                          <User size={16} strokeWidth={1.5} /> Profile
                        </Link>
                        <Link to="/my-articles" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-jepang-off-white transition-colors" data-testid="menu-my-articles">
                          <FileText size={16} strokeWidth={1.5} /> My Articles
                        </Link>
                        <Link to="/bookmarks" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-jepang-off-white transition-colors" data-testid="menu-bookmarks">
                          <Bookmark size={16} strokeWidth={1.5} /> Bookmarks
                        </Link>
                        <Link to="/points" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-jepang-off-white transition-colors" data-testid="menu-points">
                          <Award size={16} strokeWidth={1.5} /> Points History
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-jepang-off-white transition-colors border-t border-jepang-border bg-jepang-off-white" data-testid="menu-admin">
                            <LayoutDashboard size={16} strokeWidth={1.5} /> Admin Dashboard
                          </Link>
                        )}
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-jepang-off-white transition-colors border-t border-jepang-border text-jepang-red" data-testid="menu-logout">
                          <LogOut size={16} strokeWidth={1.5} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : user === false ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-xs px-4 py-2 font-semibold uppercase tracking-wider hover:text-jepang-red transition-colors" data-testid="navbar-login-btn">Login</Link>
                <Link to="/register" className="jepang-btn-primary text-xs px-4 py-2" data-testid="navbar-register-btn">Register</Link>
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
        <div className="md:hidden bg-white border-t border-jepang-border" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold uppercase tracking-wider hover:text-jepang-red"
                data-testid={`mobile-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-3 border-t border-jepang-border">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="jepang-btn-outline text-xs px-4 py-2 flex-1 text-center" data-testid="mobile-login-btn">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="jepang-btn-primary text-xs px-4 py-2 flex-1 text-center" data-testid="mobile-register-btn">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
