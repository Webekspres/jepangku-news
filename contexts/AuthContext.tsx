'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useClerk, useAuth as useClerkSession } from '@clerk/nextjs';
import type { SessionUser } from '@/lib/auth/types';

export type AuthUser = SessionUser;

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

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn } = useClerkSession();
  const [user, setUser] = useState<UserState>(null);
  const [loading, setLoading] = useState(true);
  const fetchIdRef = useRef(0);

  const checkAuth = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;

    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (fetchId !== fetchIdRef.current) return;

      if (res.ok) {
        const data = await res.json();
        setUser(data as AuthUser);
      } else {
        setUser(false);
      }
    } catch {
      if (fetchId !== fetchIdRef.current) return;
      setUser(false);
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setUser(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    void checkAuth();
  }, [isLoaded, isSignedIn, checkAuth]);

  const login = async (): Promise<AuthUser> => {
    window.location.href = '/sign-in';
    throw new Error('Redirecting to Clerk sign-in');
  };

  const register = async (): Promise<AuthUser> => {
    window.location.href = '/sign-up';
    throw new Error('Redirecting to Clerk sign-up');
  };

  const logout = useCallback(async () => {
    await signOut({ redirectUrl: '/' });
    setUser(false);
  }, [signOut]);

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
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within ClerkAuthProvider');
  return ctx;
}

export function isAuthUser(user: UserState): user is AuthUser {
  return user !== null && user !== false;
}

export function getAuthLoginPath(): string {
  return '/sign-in';
}

export function getAuthRegisterPath(): string {
  return '/sign-up';
}
