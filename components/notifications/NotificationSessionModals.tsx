"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { useAuth, isAuthUser } from "@/contexts/AuthContext";
import type { NotificationSessionDto } from "@/lib/notifications/types";
import DailyPointsModal from "@/components/notifications/DailyPointsModal";
import WelcomeModal from "@/components/notifications/WelcomeModal";

async function fetchSession(): Promise<NotificationSessionDto | null> {
  try {
    const res = await fetch("/api/notifications/session", {
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    return (await parseApiResponse(res)) as NotificationSessionDto;
  } catch {
    return null;
  }
}

async function dismissSession(payload: {
  dismissWelcome?: boolean;
  dismissDailyPoints?: boolean;
}): Promise<NotificationSessionDto | null> {
  try {
    const res = await fetch("/api/notifications/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await parseApiResponse(res)) as NotificationSessionDto;
  } catch {
    return null;
  }
}

export default function NotificationSessionModals() {
  const { user, loading, isSignedIn } = useAuth();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [dailyPoints, setDailyPoints] = useState(0);
  const sessionCheckedRef = useRef(false);

  const maybeOpenDaily = useCallback((session: NotificationSessionDto | null) => {
    if (session?.showDailyPoints) {
      setDailyPoints(session.dailyPoints);
      setDailyOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn || loading || !isAuthUser(user)) {
      sessionCheckedRef.current = false;
      setWelcomeOpen(false);
      setDailyOpen(false);
      return;
    }

    if (sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;

    void (async () => {
      const session = await fetchSession();
      if (!session) return;

      if (session.showWelcome) {
        setWelcomeOpen(true);
        return;
      }

      maybeOpenDaily(session);
    })();
  }, [isSignedIn, loading, maybeOpenDaily, user]);

  const handleWelcomeDismiss = () => {
    setWelcomeOpen(false);
    void (async () => {
      const session = await dismissSession({ dismissWelcome: true });
      maybeOpenDaily(session);
    })();
  };

  const handleDailyDismiss = () => {
    setDailyOpen(false);
    void dismissSession({ dismissDailyPoints: true });
  };

  return (
    <>
      <WelcomeModal open={welcomeOpen} onDismiss={handleWelcomeDismiss} />
      <DailyPointsModal
        open={dailyOpen}
        points={dailyPoints}
        onDismiss={handleDailyDismiss}
      />
    </>
  );
}
