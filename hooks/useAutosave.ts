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

interface UseAutosaveOptions {
  data: ArticleFormSnapshot;
  createDraft: (data: ArticleFormSnapshot) => Promise<ArticleDraftInfo>;
  updateDraft: (id: string, data: ArticleFormSnapshot) => Promise<void>;
  debounceMs?: number;
  /** Disable autosave entirely (e.g. while a manual save is in progress) */
  disabled?: boolean;
}

interface UseAutosaveReturn {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  /** Reactive draft id — null until the first save creates the article */
  draftId: string | null;
  /** Call after a successful manual save to sync draft state */
  setDraftInfo: (info: ArticleDraftInfo) => void;
  /** Returns the current draft id imperatively (no re-render on change) */
  getDraftId: () => string | null;
}

export function useAutosave({
  data,
  createDraft,
  updateDraft,
  debounceMs = 3000,
  disabled = false,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  // Reactive draft id so parent can render preview links
  const [draftId, setDraftIdState] = useState<string | null>(null);

  // Stable refs — never trigger re-renders
  const draftRef = useRef<ArticleDraftInfo | null>(null);
  const isSavingRef = useRef(false);
  const dataRef = useRef(data);
  const createDraftRef = useRef(createDraft);
  const updateDraftRef = useRef(updateDraft);
  const lastSavedSnapshotRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback refs fresh to avoid stale closures in the timer
  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { createDraftRef.current = createDraft; }, [createDraft]);
  useEffect(() => { updateDraftRef.current = updateDraft; }, [updateDraft]);

  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    const snapshot = dataRef.current;
    const snapshotStr = JSON.stringify(snapshot);

    // Nothing changed since last save
    if (snapshotStr === lastSavedSnapshotRef.current) return;

    // Minimum: title must be present
    if (!snapshot.title.trim()) return;

    isSavingRef.current = true;
    setStatus('saving');

    try {
      if (!draftRef.current) {
        const info = await createDraftRef.current(snapshot);
        draftRef.current = info;
        setDraftIdState(info.id);
      } else {
        await updateDraftRef.current(draftRef.current.id, snapshot);
      }

      lastSavedSnapshotRef.current = snapshotStr;
      setLastSavedAt(new Date());
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  // Schedule autosave on data change
  useEffect(() => {
    if (disabled) return;
    if (!data.title.trim()) return;

    setStatus('pending');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(performSave, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, debounceMs, disabled, performSave]);

  // Expose draft state sync for manual saves
  const setDraftInfo = useCallback((info: ArticleDraftInfo) => {
    draftRef.current = info;
    lastSavedSnapshotRef.current = JSON.stringify(dataRef.current);
    setDraftIdState(info.id);
    setLastSavedAt(new Date());
    setStatus('saved');
  }, []);

  const getDraftId = useCallback(() => draftRef.current?.id ?? null, []);

  return { status, lastSavedAt, draftId, setDraftInfo, getDraftId };
}
