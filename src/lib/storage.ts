import {
  DATA_VERSION,
  DEFAULT_APP_DATA,
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  type AppData,
  type ImplementationIntention,
  type StateAfter,
  type UsefulPause,
  type UserSettings,
  type WalkEvent,
  type WalkStatus,
  type WalkTrigger,
} from "./types";

export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; data: T };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWalkStatus(value: unknown): value is WalkStatus {
  return value === "active" || value === "completed" || value === "abandoned";
}

function isWalkTrigger(value: unknown): value is WalkTrigger {
  return (
    value === "craving" ||
    value === "scrolling" ||
    value === "spiraling" ||
    value === "stuck" ||
    value === "angry" ||
    value === "restless" ||
    value === "other"
  );
}

function isStateAfter(value: unknown): value is StateAfter {
  return value === "better" || value === "same" || value === "worse";
}

function isUsefulPause(value: unknown): value is UsefulPause {
  return value === "yes" || value === "somewhat" || value === "no";
}

function parseIntention(value: unknown): ImplementationIntention | undefined {
  if (!isRecord(value)) return undefined;
  const preset =
    typeof value.preset === "string" ? (value.preset as ImplementationIntention["preset"]) : undefined;
  const customText =
    typeof value.customText === "string" ? value.customText : undefined;
  if (!preset && !customText) return undefined;
  return { preset, customText };
}

function parseWalkEvent(value: unknown): WalkEvent | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id) return null;
  if (typeof value.startedAt !== "string") return null;
  if (typeof value.targetDurationSeconds !== "number") return null;
  if (!isWalkStatus(value.status)) return null;
  if (typeof value.isPractice !== "boolean") return null;
  if (typeof value.createdAt !== "string") return null;
  if (typeof value.updatedAt !== "string") return null;

  const walk: WalkEvent = {
    id: value.id,
    startedAt: value.startedAt,
    targetDurationSeconds: value.targetDurationSeconds,
    status: value.status,
    isPractice: value.isPractice,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };

  if (typeof value.endedAt === "string") walk.endedAt = value.endedAt;
  if (typeof value.actualDurationSeconds === "number") {
    walk.actualDurationSeconds = value.actualDurationSeconds;
  }
  if (isWalkTrigger(value.trigger)) walk.trigger = value.trigger;
  if (typeof value.customTrigger === "string") {
    walk.customTrigger = value.customTrigger;
  }
  if (isStateAfter(value.stateAfter)) walk.stateAfter = value.stateAfter;
  if (isUsefulPause(value.usefulPause)) walk.usefulPause = value.usefulPause;
  if (typeof value.note === "string") walk.note = value.note;

  return walk;
}

function parseSettings(value: unknown): UserSettings {
  if (!isRecord(value)) return { ...DEFAULT_SETTINGS };
  return {
    onboardingCompleted: Boolean(value.onboardingCompleted),
    implementationIntention: parseIntention(value.implementationIntention),
    defaultDurationSeconds:
      typeof value.defaultDurationSeconds === "number" &&
      value.defaultDurationSeconds > 0
        ? value.defaultDurationSeconds
        : DEFAULT_SETTINGS.defaultDurationSeconds,
    reducedMotion:
      typeof value.reducedMotion === "boolean"
        ? value.reducedMotion
        : undefined,
    installPromptDismissed:
      typeof value.installPromptDismissed === "boolean"
        ? value.installPromptDismissed
        : undefined,
  };
}

/** Validate and migrate raw parsed JSON into AppData */
export function parseAppData(raw: unknown): StorageResult<AppData> {
  if (!isRecord(raw)) {
    return {
      ok: false,
      error: "Stored data was not an object.",
      data: structuredClone(DEFAULT_APP_DATA),
    };
  }

  const version =
    typeof raw.version === "number" ? raw.version : DATA_VERSION;

  // Future migrations would branch on version here
  if (version > DATA_VERSION) {
    return {
      ok: false,
      error: "Stored data is from a newer app version.",
      data: structuredClone(DEFAULT_APP_DATA),
    };
  }

  const settings = parseSettings(raw.settings);
  const walksRaw = Array.isArray(raw.walks) ? raw.walks : [];
  const walks: WalkEvent[] = [];
  let dropped = 0;

  for (const item of walksRaw) {
    const walk = parseWalkEvent(item);
    if (walk) walks.push(walk);
    else dropped += 1;
  }

  // Ensure at most one active walk (keep most recent)
  const actives = walks
    .filter((w) => w.status === "active")
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  if (actives.length > 1) {
    const keepId = actives[0].id;
    for (let i = 0; i < walks.length; i++) {
      if (walks[i].status === "active" && walks[i].id !== keepId) {
        walks[i] = {
          ...walks[i],
          status: "abandoned",
          endedAt: walks[i].endedAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }
  }

  const data: AppData = {
    version: DATA_VERSION,
    settings,
    walks,
  };

  if (dropped > 0) {
    return {
      ok: false,
      error: `Ignored ${dropped} invalid walk record(s).`,
      data,
    };
  }

  return { ok: true, data };
}

export function serializeAppData(data: AppData): string {
  return JSON.stringify(data);
}

function canUseLocalStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__walk_instead_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function loadAppData(): StorageResult<AppData> {
  if (!canUseLocalStorage()) {
    return {
      ok: false,
      error: "Local storage is unavailable.",
      data: structuredClone(DEFAULT_APP_DATA),
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ok: true, data: structuredClone(DEFAULT_APP_DATA) };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        error: "Stored data was corrupted and could not be read.",
        data: structuredClone(DEFAULT_APP_DATA),
      };
    }
    return parseAppData(parsed);
  } catch {
    return {
      ok: false,
      error: "Could not read local storage.",
      data: structuredClone(DEFAULT_APP_DATA),
    };
  }
}

export function saveAppData(data: AppData): StorageResult<AppData> {
  if (!canUseLocalStorage()) {
    return {
      ok: false,
      error: "Local storage is unavailable. Changes may not persist.",
      data,
    };
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeAppData(data));
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: "Could not save to local storage.",
      data,
    };
  }
}

export function clearAppData(): StorageResult<AppData> {
  const empty = structuredClone(DEFAULT_APP_DATA);
  if (!canUseLocalStorage()) {
    return {
      ok: false,
      error: "Local storage is unavailable.",
      data: empty,
    };
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return { ok: true, data: empty };
  } catch {
    return {
      ok: false,
      error: "Could not clear local storage.",
      data: empty,
    };
  }
}

export function exportAppDataJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `walk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
