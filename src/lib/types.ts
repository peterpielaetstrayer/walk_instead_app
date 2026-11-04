export type WalkStatus = "active" | "completed" | "abandoned";

export type WalkTrigger =
  | "craving"
  | "scrolling"
  | "spiraling"
  | "stuck"
  | "angry"
  | "restless"
  | "other";

export type StateAfter = "better" | "same" | "worse";

export type UsefulPause = "yes" | "somewhat" | "no";

export type IntentionPreset =
  | "wanting to smoke"
  | "wanting to drink"
  | "stuck scrolling"
  | "spiraling"
  | "avoiding something"
  | "emotionally activated"
  | "other";

export interface ImplementationIntention {
  preset?: IntentionPreset;
  customText?: string;
}

export interface WalkEvent {
  id: string;
  startedAt: string;
  endedAt?: string;
  targetDurationSeconds: number;
  actualDurationSeconds?: number;
  status: WalkStatus;
  isPractice: boolean;
  trigger?: WalkTrigger;
  customTrigger?: string;
  stateAfter?: StateAfter;
  usefulPause?: UsefulPause;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  onboardingCompleted: boolean;
  implementationIntention?: ImplementationIntention;
  defaultDurationSeconds: number;
  reducedMotion?: boolean;
  installPromptDismissed?: boolean;
}

export interface AppData {
  version: number;
  settings: UserSettings;
  walks: WalkEvent[];
}

export const STORAGE_KEY = "walk-instead:v1";
export const DATA_VERSION = 1;
export const DEFAULT_DURATION_SECONDS = 10 * 60;
/** Calm-time duration choices only; the urgent-start screen never asks. */
export const DURATION_PRESETS_SECONDS: readonly number[] = [5 * 60, 10 * 60, 15 * 60, 20 * 60];
/** Active walks older than this become "stale" and show recovery UI */
export const STALE_WALK_THRESHOLD_MS = 6 * 60 * 60 * 1000;

export const DEFAULT_SETTINGS: UserSettings = {
  onboardingCompleted: false,
  defaultDurationSeconds: DEFAULT_DURATION_SECONDS,
};

export const DEFAULT_APP_DATA: AppData = {
  version: DATA_VERSION,
  settings: DEFAULT_SETTINGS,
  walks: [],
};

export const TRIGGER_LABELS: Record<WalkTrigger, string> = {
  craving: "Craving",
  scrolling: "Scrolling",
  spiraling: "Spiraling",
  stuck: "Stuck",
  angry: "Angry",
  restless: "Restless",
  other: "Other",
};

export const STATE_AFTER_LABELS: Record<StateAfter, string> = {
  better: "Better",
  same: "About the same",
  worse: "Worse",
};

export const USEFUL_PAUSE_LABELS: Record<UsefulPause, string> = {
  yes: "Yes",
  somewhat: "Somewhat",
  no: "No",
};

export const INTENTION_PRESETS: IntentionPreset[] = [
  "wanting to smoke",
  "wanting to drink",
  "stuck scrolling",
  "spiraling",
  "avoiding something",
  "emotionally activated",
  "other",
];
