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
import type { GamificationPatch, SessionUser } from '@/lib/auth/types';

type ClerkUser = ReturnType<typeof useUser>['user'];

export type AuthUser = SessionUser;

/** null = loading, false = signed out, AuthUser = profile ready */
type UserState = AuthUser | null | false;

export type { GamificationPatch } from '@/lib/auth/types';

interface AuthContextType {
  user: UserState;
  /** Saldo poin untuk UI (profil atau fetch langsung ke Core). */
  displayPoints: number;
  loading: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  clerkUser: ClerkUser;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: (gamification?: GamificationPatch) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PROFILE_RETRY_DELAYS_MS = [0, 500, 1000, 2000, 3500];

type ClerkGetToken = (options?: { skipCache?: boolean }) => Promise<string | null>;

async function fetchWithClerkSession(
  path: string,
  getToken: ClerkGetToken,
): Promise<Response> {
  const token = await getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(path, { cache: 'no-store', credentials: 'same-origin', headers });
}

async function fetchPortalProfile(getToken: ClerkGetToken): Promise<SessionUser | null> {
  const res = await fetchWithClerkSession('/api/auth/me', getToken);
  if (!res.ok) return null;
  return res.json() as Promise<SessionUser>;
}

async function fetchGamificationBalance(
  getToken: ClerkGetToken,
): Promise<GamificationPatch | null> {
  const res = await fetchWithClerkSession('/api/user/gamification', getToken);
  if (!res.ok) return null;
  return res.json() as Promise<GamificationPatch>;
}

function mergeGamification(
  profile: SessionUser,
  gamification: GamificationPatch | null,
): SessionUser {
  if (!gamification || gamification.totalPoints == null) return profile;
  return {
    ...profile,
    totalPoints: gamification.totalPoints,
    ...(gamification.totalXp != null ? { totalXp: gamification.totalXp } : {}),
    ...(gamification.currentLevel != null
      ? { currentLevel: gamification.currentLevel }
      : {}),
  };
}

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, userId, getToken } = useClerkSession();
  const { user: clerkUser, isLoaded: clerkUserLoaded } = useUser();

  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [profileSyncing, setProfileSyncing] = useState(false);
  const syncGenRef = useRef(0);

  const applyPointsBalance = useCallback((patch: GamificationPatch | null) => {
    if (patch?.totalPoints != null) {
      setPointsBalance(patch.totalPoints);
    }
  }, []);

  const syncProfile = useCallback(async () => {
    if (!isSignedIn || !userId || !clerkUserLoaded || !clerkUser) return;

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

        const [data, gamification] = await Promise.all([
          fetchPortalProfile(getToken),
          fetchGamificationBalance(getToken),
        ]);
        if (generation !== syncGenRef.current) return;

        applyPointsBalance(gamification);

        if (data) {
          setProfile(mergeGamification(data, gamification));
          return;
        }
      }
    } finally {
      if (generation === syncGenRef.current) {
        setProfileSyncing(false);
      }
    }
  }, [isSignedIn, userId, clerkUserLoaded, clerkUser, getToken, applyPointsBalance]);

  useEffect(() => {
    if (!isLoaded || !clerkUserLoaded) return;

    if (!isSignedIn || !userId || !clerkUser) {
      syncGenRef.current += 1;
      setProfile(null);
      setPointsBalance(null);
      setProfileSyncing(false);
      return;
    }

    void syncProfile();
  }, [isLoaded, clerkUserLoaded, isSignedIn, userId, clerkUser, syncProfile]);

  const user: UserState = !isLoaded
    ? null
    : !isSignedIn
      ? false
      : profile;

  const loading = !isLoaded || (isSignedIn && profileSyncing && !profile);

  const displayPoints =
    pointsBalance ?? (isAuthUser(profile) ? profile.totalPoints : null) ?? 0;

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
    setPointsBalance(null);
    setProfileSyncing(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch { /* ignore */ }
    await signOut({ redirectUrl: '/' });
  }, [signOut]);

  const refreshUser = useCallback(
    async (gamificationPatch?: GamificationPatch) => {
      if (!isSignedIn || !userId) return;

      applyPointsBalance(gamificationPatch ?? null);
      if (gamificationPatch?.totalPoints != null) {
        setProfile((prev) =>
          prev ? mergeGamification(prev, gamificationPatch) : prev,
        );
      }

      await syncProfile();
    },
    [isSignedIn, userId, syncProfile, applyPointsBalance],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        displayPoints,
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
