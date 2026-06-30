import { useCallback, useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface ArticleDraftInfo {
  id: string;
  slug: string;
}

export interface ArticleFormSnapshot {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
  tags: string;
}

/** Shape persisted in localStorage for a single in-progress draft. */
export interface StoredDraft {
  /** Stable client-generated id used for idempotent DB upserts. */
  clientId: string;
  data: ArticleFormSnapshot;
  /** Epoch ms of the last local save. */
  savedAt: number;
  /** Whether the draft has been flushed to the DB at least once. */
  persisted: boolean;
}

interface UseAutosaveOptions {
  data: ArticleFormSnapshot;
  /** Stable client-generated id (uuid) shared with the manual-save flow. */
  clientId: string;
  /** localStorage namespace; must be unique per page/form. */
  storageKey: string;
  /** Upsert the draft to the DB (status DRAFT). Resolves on success. */
  flushDraft: (clientId: string, data: ArticleFormSnapshot) => Promise<void>;
  /** Fire-and-forget flush that survives a page unload (navigator.sendBeacon). */
  beaconFlush: (clientId: string, data: ArticleFormSnapshot) => void;
  /**
   * Opsional: siapkan snapshot sebelum flush (mis. commit cover image yang distage).
   * Mengembalikan snapshot terbaru untuk disimpan ke DB.
   */
  prepareSnapshot?: () => Promise<ArticleFormSnapshot>;
  /** Debounce before writing to localStorage. */
  debounceMs?: number;
  /** Debounce sebelum flush ke DB (server-side draft). Default 3 detik. */
  serverFlushDebounceMs?: number;
  /** Disable autosave entirely (e.g. while a manual save is in progress). */
  disabled?: boolean;
}

interface UseAutosaveReturn {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  /** DB-confirmed draft id — null until flushed to the DB at least once. */
  draftId: string | null;
  /** Read a persisted local draft (call once on mount to offer a restore). */
  loadStored: () => StoredDraft | null;
  /** Restore internal state from a stored draft the user chose to recover. */
  restore: (record: StoredDraft) => void;
  /** Remove the persisted local draft (after a decline or a final save). */
  clearStored: () => void;
  /** Mark the current snapshot as fully persisted (after an explicit save). */
  markSaved: (info?: ArticleDraftInfo) => void;
}

function snapshotIsEmpty(data: ArticleFormSnapshot): boolean {
  return !data.title.trim() && !data.content.trim() && !data.excerpt.trim();
}

/** Generate a stable client id for a brand-new draft (used for idempotent upserts). */
export function newDraftClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Server-first autosave dengan localStorage sebagai cadangan offline.
 *
 * On every change the snapshot is debounced into `localStorage` (tanpa blob:
 * URLs) dan ke database (idempotent upsert keyed by stable client id) setelah
 * `serverFlushDebounceMs`. Flush tambahan saat unmount / pagehide.
 */
export function useAutosave({
  data,
  clientId,
  storageKey,
  flushDraft,
  beaconFlush,
  prepareSnapshot,
  debounceMs = 800,
  serverFlushDebounceMs = 3000,
  disabled = false,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  const dataRef = useRef(data);
  const clientIdRef = useRef(clientId);
  const flushRef = useRef(flushDraft);
  const beaconRef = useRef(beaconFlush);
  const prepareRef = useRef(prepareSnapshot);
  const disabledRef = useRef(disabled);

  // Snapshot bookkeeping
  const lastLocalSnapshotRef = useRef<string>('');
  const lastFlushedSnapshotRef = useRef<string>('');
  const persistedRef = useRef<boolean>(false);
  // True when localStorage holds changes not yet flushed to the DB.
  const dirtyRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { clientIdRef.current = clientId; }, [clientId]);
  useEffect(() => { flushRef.current = flushDraft; }, [flushDraft]);
  useEffect(() => { beaconRef.current = beaconFlush; }, [beaconFlush]);
  useEffect(() => { prepareRef.current = prepareSnapshot; }, [prepareSnapshot]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  const sanitizeSnapshot = useCallback((snapshot: ArticleFormSnapshot): ArticleFormSnapshot => ({
    ...snapshot,
    coverImageUrl: snapshot.coverImageUrl.startsWith('blob:')
      ? ''
      : snapshot.coverImageUrl,
  }), []);

  const writeLocal = useCallback(() => {
    if (typeof window === 'undefined') return;
    const snapshot = sanitizeSnapshot(dataRef.current);
    if (!snapshot.title.trim()) return;

    const snapshotStr = JSON.stringify(snapshot);
    if (snapshotStr === lastLocalSnapshotRef.current) return;

    const record: StoredDraft = {
      clientId: clientIdRef.current,
      data: snapshot,
      savedAt: Date.now(),
      persisted: persistedRef.current,
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(record));
    } catch {
      // Storage full / unavailable — keep editing, flush-on-leave still works.
    }

    lastLocalSnapshotRef.current = snapshotStr;
    if (snapshotStr !== lastFlushedSnapshotRef.current) dirtyRef.current = true;
    setLastSavedAt(new Date());
    setStatus('saved');
  }, [sanitizeSnapshot, storageKey]);

  const resolveSnapshot = useCallback(async (): Promise<ArticleFormSnapshot> => {
    const prepared = prepareRef.current
      ? await prepareRef.current()
      : dataRef.current;
    return sanitizeSnapshot(prepared);
  }, [sanitizeSnapshot]);

  const flushToDbRef = useRef<() => Promise<void>>(async () => {});

  const flushToDb = useCallback(async () => {
    if (!dirtyRef.current) return;
    let snapshot = await resolveSnapshot();
    if (!snapshot.title.trim() || !snapshot.content.trim()) return;

    const snapshotStr = JSON.stringify(snapshot);
    if (snapshotStr === lastFlushedSnapshotRef.current) {
      dirtyRef.current = false;
      return;
    }

    try {
      setStatus('saving');
      await flushRef.current(clientIdRef.current, snapshot);
      dataRef.current = snapshot;
      lastFlushedSnapshotRef.current = snapshotStr;
      lastLocalSnapshotRef.current = snapshotStr;
      dirtyRef.current = false;
      persistedRef.current = true;
      setDraftId(clientIdRef.current);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({
              clientId: clientIdRef.current,
              data: snapshot,
              savedAt: Date.now(),
              persisted: true,
            } satisfies StoredDraft),
          );
        } catch {
          /* ignore */
        }
      }
      setLastSavedAt(new Date());
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [resolveSnapshot, storageKey]);

  useEffect(() => { flushToDbRef.current = flushToDb; }, [flushToDb]);

  // Schedule a local save on data change.
  useEffect(() => {
    if (disabled) return;
    if (!data.title.trim()) return;

    setStatus('pending');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(writeLocal, debounceMs);

    if (serverTimerRef.current) clearTimeout(serverTimerRef.current);
    serverTimerRef.current = setTimeout(() => {
      void flushToDbRef.current();
    }, serverFlushDebounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (serverTimerRef.current) clearTimeout(serverTimerRef.current);
    };
  }, [data, debounceMs, disabled, serverFlushDebounceMs, writeLocal]);

  // Flush on the way out. Empty deps so the cleanup only runs on true unmount.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPageHide = () => {
      if (disabledRef.current || !dirtyRef.current) return;
      const snapshot = sanitizeSnapshot(dataRef.current);
      if (!snapshot.title.trim() || !snapshot.content.trim()) return;
      beaconRef.current(clientIdRef.current, snapshot);
      dirtyRef.current = false;
    };

    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      // In-app navigation: flush via fetch (SPA realm survives, so it resolves).
      if (!disabledRef.current) void flushToDbRef.current();
    };
  }, []);

  const loadStored = useCallback((): StoredDraft | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredDraft;
      if (
        !parsed ||
        typeof parsed.clientId !== 'string' ||
        !parsed.data ||
        snapshotIsEmpty(parsed.data)
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [storageKey]);

  const restore = useCallback((record: StoredDraft) => {
    clientIdRef.current = record.clientId;
    const snapshotStr = JSON.stringify(record.data);
    lastLocalSnapshotRef.current = snapshotStr;
    persistedRef.current = record.persisted;
    if (record.persisted) {
      lastFlushedSnapshotRef.current = snapshotStr;
      dirtyRef.current = false;
      setDraftId(record.clientId);
    } else {
      lastFlushedSnapshotRef.current = '';
      dirtyRef.current = true;
    }
    setStatus('saved');
    setLastSavedAt(new Date(record.savedAt));
  }, []);

  const clearStored = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    dirtyRef.current = false;
    lastLocalSnapshotRef.current = '';
  }, [storageKey]);

  const markSaved = useCallback((info?: ArticleDraftInfo) => {
    const snapshotStr = JSON.stringify(dataRef.current);
    lastLocalSnapshotRef.current = snapshotStr;
    lastFlushedSnapshotRef.current = snapshotStr;
    dirtyRef.current = false;
    persistedRef.current = true;
    if (info?.id) setDraftId(info.id);
    setLastSavedAt(new Date());
    setStatus('saved');
  }, []);

  return { status, lastSavedAt, draftId, loadStored, restore, clearStored, markSaved };
}
