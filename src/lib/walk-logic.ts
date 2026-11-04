import {
  STALE_WALK_THRESHOLD_MS,
  type StateAfter,
  type UsefulPause,
  type WalkEvent,
} from "./types";

export function getElapsedSeconds(startedAt: string, nowMs = Date.now()): number {
  const start = Date.parse(startedAt);
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((nowMs - start) / 1000));
}

export function getRemainingSeconds(
  startedAt: string,
  targetDurationSeconds: number,
  nowMs = Date.now(),
): number {
  const elapsed = getElapsedSeconds(startedAt, nowMs);
  return Math.max(0, targetDurationSeconds - elapsed);
}

export function isTargetReached(
  startedAt: string,
  targetDurationSeconds: number,
  nowMs = Date.now(),
): boolean {
  return getElapsedSeconds(startedAt, nowMs) >= targetDurationSeconds;
}

export function isOvertime(
  startedAt: string,
  targetDurationSeconds: number,
  nowMs = Date.now(),
): boolean {
  return getElapsedSeconds(startedAt, nowMs) > targetDurationSeconds;
}

/** Progress 0–1 clipped to target. Overtime stays at 1. */
export function getTimerProgress(
  startedAt: string,
  targetDurationSeconds: number,
  nowMs = Date.now(),
): number {
  if (targetDurationSeconds <= 0) return 1;
  const elapsed = getElapsedSeconds(startedAt, nowMs);
  return Math.min(1, elapsed / targetDurationSeconds);
}

export function getDisplaySeconds(
  startedAt: string,
  targetDurationSeconds: number,
  nowMs = Date.now(),
): { mode: "countdown" | "overtime"; seconds: number } {
  const elapsed = getElapsedSeconds(startedAt, nowMs);
  if (elapsed >= targetDurationSeconds) {
    return { mode: "overtime", seconds: elapsed };
  }
  return { mode: "countdown", seconds: targetDurationSeconds - elapsed };
}

export function findActiveWalk(walks: WalkEvent[]): WalkEvent | undefined {
  return walks.find((w) => w.status === "active");
}

export function isStaleActiveWalk(
  walk: WalkEvent,
  nowMs = Date.now(),
  thresholdMs = STALE_WALK_THRESHOLD_MS,
): boolean {
  if (walk.status !== "active") return false;
  const start = Date.parse(walk.startedAt);
  if (Number.isNaN(start)) return true;
  return nowMs - start >= thresholdMs;
}

export function createWalkEvent(params: {
  id: string;
  startedAt?: string;
  targetDurationSeconds: number;
  isPractice?: boolean;
}): WalkEvent {
  const now = params.startedAt ?? new Date().toISOString();
  return {
    id: params.id,
    startedAt: now,
    targetDurationSeconds: params.targetDurationSeconds,
    status: "active",
    isPractice: params.isPractice ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

export function endWalkEvent(
  walk: WalkEvent,
  endedAt = new Date().toISOString(),
): WalkEvent {
  const actualDurationSeconds = getElapsedSeconds(
    walk.startedAt,
    Date.parse(endedAt),
  );
  return {
    ...walk,
    endedAt,
    actualDurationSeconds,
    status: "completed",
    updatedAt: endedAt,
  };
}

export function abandonWalkEvent(
  walk: WalkEvent,
  endedAt = new Date().toISOString(),
): WalkEvent {
  const actualDurationSeconds = getElapsedSeconds(
    walk.startedAt,
    Date.parse(endedAt),
  );
  return {
    ...walk,
    endedAt,
    actualDurationSeconds,
    status: "abandoned",
    updatedAt: endedAt,
  };
}

export interface HistorySummary {
  momentsInterrupted: number;
  betterCount: number;
  completedWithState: number;
  usefulPauseCount: number;
  completedWithPauseRating: number;
  totalWalkingSeconds: number;
  hasEnoughForFeelingSummary: boolean;
  hasEnoughForPauseSummary: boolean;
}

function isCountableCompleted(walk: WalkEvent): boolean {
  return walk.status === "completed" && !walk.isPractice;
}

export function calculateHistorySummary(walks: WalkEvent[]): HistorySummary {
  const completed = walks.filter(isCountableCompleted);
  const momentsInterrupted = completed.length;

  let betterCount = 0;
  let completedWithState = 0;
  let usefulPauseCount = 0;
  let completedWithPauseRating = 0;
  let totalWalkingSeconds = 0;

  for (const walk of completed) {
    totalWalkingSeconds += walk.actualDurationSeconds ?? 0;
    if (walk.stateAfter) {
      completedWithState += 1;
      if (walk.stateAfter === "better") betterCount += 1;
    }
    if (walk.usefulPause) {
      completedWithPauseRating += 1;
      if (walk.usefulPause === "yes" || walk.usefulPause === "somewhat") {
        usefulPauseCount += 1;
      }
    }
  }

  return {
    momentsInterrupted,
    betterCount,
    completedWithState,
    usefulPauseCount,
    completedWithPauseRating,
    totalWalkingSeconds,
    // Avoid misleading fractions after a single event
    hasEnoughForFeelingSummary: completedWithState >= 2,
    hasEnoughForPauseSummary: completedWithPauseRating >= 2,
  };
}

export function sortWalksRecentFirst(walks: WalkEvent[]): WalkEvent[] {
  return [...walks].sort(
    (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
  );
}

export function buildIntentionStatement(params: {
  preset?: string;
  customText?: string;
}): string {
  const moment =
    params.preset === "other"
      ? (params.customText?.trim() || "something difficult")
      : params.preset || params.customText?.trim() || "something difficult";

  return `When I notice myself ${moment}, I will walk before deciding what to do next.`;
}

export type RecoveryAction = "resume" | "check-in" | "stale";

export function getRecoveryAction(
  walk: WalkEvent,
  nowMs = Date.now(),
): RecoveryAction {
  if (isStaleActiveWalk(walk, nowMs)) return "stale";
  if (isTargetReached(walk.startedAt, walk.targetDurationSeconds, nowMs)) {
    return "check-in";
  }
  return "resume";
}

export function countByStateAfter(
  walks: WalkEvent[],
): Record<StateAfter, number> {
  const counts: Record<StateAfter, number> = {
    better: 0,
    same: 0,
    worse: 0,
  };
  for (const walk of walks) {
    if (isCountableCompleted(walk) && walk.stateAfter) {
      counts[walk.stateAfter] += 1;
    }
  }
  return counts;
}

export function countUsefulPauses(walks: WalkEvent[]): number {
  return walks.filter(
    (w) =>
      isCountableCompleted(w) &&
      (w.usefulPause === "yes" || w.usefulPause === "somewhat"),
  ).length;
}

export type { UsefulPause };
