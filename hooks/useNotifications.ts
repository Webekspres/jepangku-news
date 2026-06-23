"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import type { NotificationDto } from "@/lib/notifications/types";
import {
  invalidateNotifications,
  subscribeNotificationInvalidation,
} from "@/lib/notifications/client-invalidate";

const POLL_INTERVAL_MS = 60_000;

type StreamMessage = {
  type?: string;
  unreadCount?: number;
};

type NotificationListResponse = {
  items: NotificationDto[];
  nextCursor: string | null;
};

async function fetchUnreadCount(): Promise<number | null> {
  try {
    const res = await fetch("/api/notifications/unread-count", {
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const data = (await parseApiResponse(res)) as { unreadCount?: number };
    return typeof data.unreadCount === "number" ? data.unreadCount : 0;
  } catch {
    return null;
  }
}

async function fetchNotificationList(
  unreadOnly: boolean,
): Promise<NotificationDto[]> {
  const params = new URLSearchParams({ limit: "20" });
  if (unreadOnly) params.set("unreadOnly", "true");

  const res = await fetch(`/api/notifications?${params.toString()}`, {
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("Gagal memuat notifikasi");
  const data = (await parseApiResponse(res)) as NotificationListResponse;
  return Array.isArray(data.items) ? data.items : [];
}

export function useNotifications(enabled = true) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listLoaded, setListLoaded] = useState(false);
  const [streamConnected, setStreamConnected] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const refreshUnread = useCallback(async () => {
    const count = await fetchUnreadCount();
    if (count !== null) setUnreadCount(count);
  }, []);

  const loadList = useCallback(async (options?: { force?: boolean }) => {
    if (!enabled) return;
    if (listLoaded && !options?.force) return;

    setListLoading(true);
    try {
      const nextItems = await fetchNotificationList(false);
      setItems(nextItems);
      setListLoaded(true);
    } catch {
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }, [enabled, listLoaded]);

  const reloadList = useCallback(async () => {
    if (!enabled) return;
    setListLoading(true);
    try {
      const nextItems = await fetchNotificationList(false);
      setItems(nextItems);
      setListLoaded(true);
    } catch {
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }, [enabled]);

  const markRead = useCallback(
    async (notificationId: string) => {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        credentials: "same-origin",
      });
      if (!res.ok) return false;

      setItems((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
      invalidateNotifications();
      return true;
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    const res = await fetch("/api/notifications/read-all", {
      method: "POST",
      credentials: "same-origin",
    });
    if (!res.ok) return false;

    const now = new Date().toISOString();
    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? now })));
    setUnreadCount(0);
    invalidateNotifications();
    return true;
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(() => {
      void refreshUnread();
    }, POLL_INTERVAL_MS);
  }, [refreshUnread]);

  const closeStream = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setStreamConnected(false);
  }, []);

  const connectStream = useCallback(() => {
    if (!enabled || typeof EventSource === "undefined") {
      startPolling();
      return;
    }

    closeStream();
    const es = new EventSource("/api/notifications/stream");
    eventSourceRef.current = es;

    es.onopen = () => setStreamConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamMessage;
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
          if (listLoaded) void reloadList();
        }
      } catch {
        // ignore malformed SSE payloads
      }
    };

    es.onerror = () => {
      setStreamConnected(false);
      closeStream();
      startPolling();
    };
  }, [closeStream, enabled, listLoaded, reloadList, startPolling]);

  useEffect(() => {
    if (!enabled) {
      closeStream();
      stopPolling();
      return;
    }

    void refreshUnread();
    connectStream();
    startPolling();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshUnread();
        if (!eventSourceRef.current) connectStream();
      }
    };

    const unsubscribe = subscribeNotificationInvalidation(() => {
      void refreshUnread();
      if (listLoaded) void reloadList();
    });

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      unsubscribe();
      closeStream();
      stopPolling();
    };
  }, [
    closeStream,
    connectStream,
    enabled,
    listLoaded,
    refreshUnread,
    reloadList,
    startPolling,
    stopPolling,
  ]);

  return {
    unreadCount,
    items,
    listLoading,
    listLoaded,
    streamConnected,
    refreshUnread,
    loadList,
    reloadList,
    markRead,
    markAllRead,
  };
}

/** @deprecated Prefer `useNotifications` — kept for narrow unread-only consumers. */
export function useNotificationUnreadCount(enabled = true) {
  const { unreadCount, streamConnected, refreshUnread } = useNotifications(enabled);
  return { unreadCount, streamConnected, refresh: refreshUnread };
}
