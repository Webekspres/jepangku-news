'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  totalPoints: number;
  status: string;
  createdAt: string;
}

// null = loading, false = not authenticated, AuthUser = authenticated
type UserState = AuthUser | null | false;

interface AuthContextType {
  user: UserState;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data as AuthUser);
      } else {
        setUser(false);
      }
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Masuk gagal');
    }
    const data = await res.json() as AuthUser;
    setUser(data);
    return data;
  };

  const register = async (formData: { name: string; username: string; email: string; password: string }): Promise<AuthUser> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Pendaftaran gagal');
    }
    const data = await res.json() as AuthUser;
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    setUser(false);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json() as AuthUser;
        setUser(data);
      }
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function isAuthUser(user: UserState): user is AuthUser {
  return user !== null && user !== false;
}
