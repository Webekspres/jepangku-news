'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useClerk, useAuth as useClerkSession, useUser } from '@clerk/nextjs';
import type { SessionUser } from '@/lib/auth/types';

type ClerkUser = ReturnType<typeof useUser>['user'];

export type AuthUser = SessionUser;

/** null = loading, false = signed out, AuthUser = profile ready */
type UserState = AuthUser | null | false;

interface AuthContextType {
  user: UserState;
  loading: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  clerkUser: ClerkUser;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PROFILE_RETRY_DELAYS_MS = [0, 500, 1000, 2000, 3500];

async function fetchPortalProfile(): Promise<SessionUser | null> {
  const res = await fetch('/api/auth/me', {
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!res.ok) return null;
  return res.json() as Promise<SessionUser>;
}

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, userId } = useClerkSession();
  const { user: clerkUser } = useUser();

  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [profileSyncing, setProfileSyncing] = useState(false);
  const syncGenRef = useRef(0);

  const syncProfile = useCallback(async () => {
    if (!isSignedIn || !userId) return;

    const generation = ++syncGenRef.current;
    setProfileSyncing(true);

    try {
      for (let attempt = 0; attempt < PROFILE_RETRY_DELAYS_MS.length; attempt += 1) {
        if (generation !== syncGenRef.current) return;

        const delay = PROFILE_RETRY_DELAYS_MS[attempt];
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          if (generation !== syncGenRef.current) return;
        }

        const data = await fetchPortalProfile();
        if (generation !== syncGenRef.current) return;

        if (data) {
          setProfile(data);
          return;
        }
      }
    } finally {
      if (generation === syncGenRef.current) {
        setProfileSyncing(false);
      }
    }
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      syncGenRef.current += 1;
      setProfile(null);
      setProfileSyncing(false);
      return;
    }

    void syncProfile();
  }, [isLoaded, isSignedIn, userId, syncProfile]);

  const user: UserState = !isLoaded
    ? null
    : !isSignedIn
      ? false
      : profile;

  const loading = !isLoaded || (isSignedIn && profileSyncing && !profile);

  const login = async (): Promise<AuthUser> => {
    window.location.href = '/sign-in';
    throw new Error('Redirecting to Clerk sign-in');
  };

  const register = async (): Promise<AuthUser> => {
    window.location.href = '/sign-up';
    throw new Error('Redirecting to Clerk sign-up');
  };

  const logout = useCallback(async () => {
    syncGenRef.current += 1;
    setProfile(null);
    setProfileSyncing(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch { /* ignore */ }
    await signOut({ redirectUrl: '/' });
  }, [signOut]);

  const refreshUser = useCallback(async () => {
    if (!isSignedIn || !userId) return;
    await syncProfile();
  }, [isSignedIn, userId, syncProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoaded,
        isSignedIn: Boolean(isSignedIn),
        clerkUser,
        login,
        register,
        logout,
        refreshUser,
      }}
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
