"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_APP_DATA,
  type AppData,
  type StateAfter,
  type UsefulPause,
  type UserSettings,
  type WalkEvent,
  type WalkTrigger,
} from "./types";
import {
  clearAppData,
  createId,
  exportAppDataJson,
  loadAppData,
  saveAppData,
} from "./storage";
import {
  abandonWalkEvent,
  createWalkEvent,
  endWalkEvent,
  findActiveWalk,
} from "./walk-logic";

type StorageAvailability = "unknown" | "available" | "unavailable";

interface StoreSnapshot {
  hydrated: boolean;
  data: AppData;
  storageError: string | null;
  storageAvailability: StorageAvailability;
}

interface WalkStoreValue extends StoreSnapshot {
  activeWalk: WalkEvent | undefined;
  updateSettings: (partial: Partial<UserSettings>) => void;
  startWalk: (opts?: { isPractice?: boolean }) => WalkEvent;
  updateWalk: (id: string, patch: Partial<WalkEvent>) => void;
  completeWalkCheckIn: (
    id: string,
    payload: {
      stateAfter: StateAfter;
      usefulPause?: UsefulPause;
      note?: string;
    },
  ) => void;
  endActiveWalkForCheckIn: (id: string) => void;
  abandonWalk: (id: string) => void;
  deleteWalk: (id: string) => void;
  getWalk: (id: string) => WalkEvent | undefined;
  setWalkTrigger: (
    id: string,
    trigger: WalkTrigger | undefined,
    customTrigger?: string,
  ) => void;
  exportJson: () => string;
  deleteAllData: () => void;
  completeOnboarding: () => void;
}

const WalkStoreContext = createContext<WalkStoreValue | null>(null);

const serverSnapshot: StoreSnapshot = {
  hydrated: false,
  data: DEFAULT_APP_DATA,
  storageError: null,
  storageAvailability: "unknown",
};

let snapshot: StoreSnapshot = serverSnapshot;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setSnapshot(next: StoreSnapshot) {
  snapshot = next;
  emit();
}

function hydrateFromStorage() {
  if (snapshot.hydrated || typeof window === "undefined") return;
  const result = loadAppData();
  snapshot = {
    hydrated: true,
    data: result.data,
    storageError: result.ok ? null : result.error,
    storageAvailability:
      !result.ok && result.error === "Local storage is unavailable."
        ? "unavailable"
        : "available",
  };
}

function persist(updater: (prev: AppData) => AppData) {
  hydrateFromStorage();
  const next = updater(snapshot.data);
  const result = saveAppData(next);
  setSnapshot({
    hydrated: true,
    data: result.data,
    storageError: result.ok ? null : result.error,
    storageAvailability:
      !result.ok && result.error.includes("unavailable")
        ? "unavailable"
        : "available",
  });
  return result.data;
}

function subscribe(listener: () => void) {
  const wasHydrated = snapshot.hydrated;
  hydrateFromStorage();
  listeners.add(listener);
  if (!wasHydrated && snapshot.hydrated) {
    queueMicrotask(() => {
      emit();
    });
  }
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function WalkStoreProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    persist((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  }, []);

  const startWalk = useCallback((opts?: { isPractice?: boolean }) => {
    const existing = findActiveWalk(snapshot.data.walks);
    if (existing) return existing;

    const walk = createWalkEvent({
      id: createId(),
      targetDurationSeconds: snapshot.data.settings.defaultDurationSeconds,
      isPractice: opts?.isPractice ?? false,
    });

    persist((prev) => ({
      ...prev,
      walks: [walk, ...prev.walks],
    }));
    return walk;
  }, []);

  const updateWalk = useCallback((id: string, patch: Partial<WalkEvent>) => {
    const now = new Date().toISOString();
    persist((prev) => ({
      ...prev,
      walks: prev.walks.map((w) =>
        w.id === id ? { ...w, ...patch, updatedAt: now } : w,
      ),
    }));
  }, []);

  const endActiveWalkForCheckIn = useCallback((id: string) => {
    persist((prev) => ({
      ...prev,
      walks: prev.walks.map((w) =>
        w.id === id && w.status === "active" ? endWalkEvent(w) : w,
      ),
    }));
  }, []);

  const completeWalkCheckIn = useCallback(
    (
      id: string,
      payload: {
        stateAfter: StateAfter;
        usefulPause?: UsefulPause;
        note?: string;
      },
    ) => {
      const now = new Date().toISOString();
      persist((prev) => ({
        ...prev,
        walks: prev.walks.map((w) => {
          if (w.id !== id) return w;
          const base = w.status === "active" ? endWalkEvent(w, now) : w;
          return {
            ...base,
            stateAfter: payload.stateAfter,
            usefulPause: payload.usefulPause,
            note: payload.note ?? base.note,
            updatedAt: now,
          };
        }),
      }));
    },
    [],
  );

  const abandonWalk = useCallback((id: string) => {
    persist((prev) => ({
      ...prev,
      walks: prev.walks.map((w) =>
        w.id === id && w.status === "active" ? abandonWalkEvent(w) : w,
      ),
    }));
  }, []);

  const deleteWalk = useCallback((id: string) => {
    persist((prev) => ({
      ...prev,
      walks: prev.walks.filter((w) => w.id !== id),
    }));
  }, []);

  const getWalk = useCallback(
    (id: string) => snap.data.walks.find((w) => w.id === id),
    [snap.data.walks],
  );

  const setWalkTrigger = useCallback(
    (id: string, trigger: WalkTrigger | undefined, customTrigger?: string) => {
      updateWalk(id, {
        trigger,
        customTrigger: trigger === "other" ? customTrigger : undefined,
      });
    },
    [updateWalk],
  );

  const exportJson = useCallback(() => exportAppDataJson(snapshot.data), []);

  const deleteAllData = useCallback(() => {
    const result = clearAppData();
    setSnapshot({
      hydrated: true,
      data: result.data,
      storageError: result.ok ? null : result.error,
      storageAvailability: result.ok ? "available" : "unavailable",
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    updateSettings({ onboardingCompleted: true });
  }, [updateSettings]);

  const value = useMemo<WalkStoreValue>(
    () => ({
      ...snap,
      activeWalk: findActiveWalk(snap.data.walks),
      updateSettings,
      startWalk,
      updateWalk,
      completeWalkCheckIn,
      endActiveWalkForCheckIn,
      abandonWalk,
      deleteWalk,
      getWalk,
      setWalkTrigger,
      exportJson,
      deleteAllData,
      completeOnboarding,
    }),
    [
      snap,
      updateSettings,
      startWalk,
      updateWalk,
      completeWalkCheckIn,
      endActiveWalkForCheckIn,
      abandonWalk,
      deleteWalk,
      getWalk,
      setWalkTrigger,
      exportJson,
      deleteAllData,
      completeOnboarding,
    ],
  );

  return (
    <WalkStoreContext.Provider value={value}>
      {children}
    </WalkStoreContext.Provider>
  );
}

export function useWalkStore(): WalkStoreValue {
  const ctx = useContext(WalkStoreContext);
  if (!ctx) {
    throw new Error("useWalkStore must be used within WalkStoreProvider");
  }
  return ctx;
}
