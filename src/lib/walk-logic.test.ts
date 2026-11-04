import { describe, expect, it } from "vitest";
import {
  formatDurationHuman,
  formatTimerDisplay,
  formatWalkDateTime,
} from "@/lib/format";
import {
  calculateHistorySummary,
  createWalkEvent,
  endWalkEvent,
  findActiveWalk,
  getDisplaySeconds,
  getElapsedSeconds,
  getRecoveryAction,
  getRemainingSeconds,
  getTimerProgress,
  isStaleActiveWalk,
  isTargetReached,
  sortWalksRecentFirst,
} from "@/lib/walk-logic";
import { parseAppData, serializeAppData } from "@/lib/storage";
import {
  DEFAULT_APP_DATA,
  STALE_WALK_THRESHOLD_MS,
  type WalkEvent,
} from "@/lib/types";

function walk(partial: Partial<WalkEvent> & Pick<WalkEvent, "id" | "startedAt">): WalkEvent {
  const now = partial.startedAt;
  return {
    targetDurationSeconds: 600,
    status: "completed",
    isPractice: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe("timer calculations", () => {
  it("computes elapsed from timestamps", () => {
    const start = "2026-01-01T12:00:00.000Z";
    const now = Date.parse(start) + 125_000;
    expect(getElapsedSeconds(start, now)).toBe(125);
  });

  it("countdown and overtime display", () => {
    const start = "2026-01-01T12:00:00.000Z";
    const mid = Date.parse(start) + 120_000;
    const over = Date.parse(start) + 720_000;
    expect(getDisplaySeconds(start, 600, mid)).toEqual({
      mode: "countdown",
      seconds: 480,
    });
    expect(getDisplaySeconds(start, 600, over)).toEqual({
      mode: "overtime",
      seconds: 720,
    });
    expect(getRemainingSeconds(start, 600, mid)).toBe(480);
    expect(isTargetReached(start, 600, over)).toBe(true);
    expect(getTimerProgress(start, 600, mid)).toBeCloseTo(0.2);
    expect(getTimerProgress(start, 600, over)).toBe(1);
  });

  it("handles invalid start", () => {
    expect(getElapsedSeconds("not-a-date")).toBe(0);
  });
});

describe("duration formatting", () => {
  it("formats timer and human durations", () => {
    expect(formatTimerDisplay(125)).toBe("2:05");
    expect(formatTimerDisplay(3725)).toBe("1:02:05");
    expect(formatDurationHuman(45)).toBe("45 sec");
    expect(formatDurationHuman(840)).toBe("14 min");
    expect(formatDurationHuman(5040)).toBe("1 hr 24 min");
    expect(formatDurationHuman(3600)).toBe("1 hr");
  });

  it("groups dates", () => {
    const now = new Date("2026-07-15T15:00:00");
    expect(formatWalkDateTime("2026-07-15T09:18:00", now)).toMatch(/^Today,/);
    expect(formatWalkDateTime("2026-07-14T09:18:00", now)).toMatch(
      /^Yesterday,/,
    );
  });
});

describe("active-walk recovery", () => {
  it("finds active walk and detects stale", () => {
    const active = createWalkEvent({
      id: "a1",
      startedAt: new Date(Date.now() - 60_000).toISOString(),
      targetDurationSeconds: 600,
    });
    const completed = walk({
      id: "c1",
      startedAt: "2026-01-01T00:00:00.000Z",
      status: "completed",
      actualDurationSeconds: 600,
    });
    expect(findActiveWalk([completed, active])?.id).toBe("a1");
    expect(isStaleActiveWalk(active)).toBe(false);

    const old = createWalkEvent({
      id: "old",
      startedAt: new Date(Date.now() - STALE_WALK_THRESHOLD_MS - 1000).toISOString(),
      targetDurationSeconds: 600,
    });
    expect(isStaleActiveWalk(old)).toBe(true);
    expect(getRecoveryAction(old)).toBe("stale");
  });

  it("offers check-in when target reached", () => {
    const w = createWalkEvent({
      id: "t1",
      startedAt: new Date(Date.now() - 601_000).toISOString(),
      targetDurationSeconds: 600,
    });
    expect(getRecoveryAction(w)).toBe("check-in");
  });

  it("ends walk with actual duration", () => {
    const start = "2026-01-01T12:00:00.000Z";
    const ended = "2026-01-01T12:14:00.000Z";
    const active = createWalkEvent({
      id: "e1",
      startedAt: start,
      targetDurationSeconds: 600,
    });
    const done = endWalkEvent(active, ended);
    expect(done.status).toBe("completed");
    expect(done.actualDurationSeconds).toBe(840);
  });
});

describe("history summaries", () => {
  it("excludes practice walks from moments interrupted", () => {
    const walks: WalkEvent[] = [
      walk({
        id: "1",
        startedAt: "2026-01-01T10:00:00.000Z",
        actualDurationSeconds: 600,
        stateAfter: "better",
        usefulPause: "yes",
      }),
      walk({
        id: "2",
        startedAt: "2026-01-02T10:00:00.000Z",
        actualDurationSeconds: 300,
        isPractice: true,
        stateAfter: "better",
        usefulPause: "yes",
      }),
      walk({
        id: "3",
        startedAt: "2026-01-03T10:00:00.000Z",
        actualDurationSeconds: 900,
        stateAfter: "same",
        usefulPause: "somewhat",
      }),
    ];
    const summary = calculateHistorySummary(walks);
    expect(summary.momentsInterrupted).toBe(2);
    expect(summary.betterCount).toBe(1);
    expect(summary.completedWithState).toBe(2);
    expect(summary.usefulPauseCount).toBe(2);
    expect(summary.completedWithPauseRating).toBe(2);
    expect(summary.totalWalkingSeconds).toBe(1500);
    expect(summary.hasEnoughForFeelingSummary).toBe(true);
  });

  it("preserves a completed pause with no feelings or useful-pause rating", () => {
    const completed = endWalkEvent(
      createWalkEvent({
        id: "no-rating",
        startedAt: "2026-07-15T12:00:00.000Z",
        targetDurationSeconds: 600,
      }),
      "2026-07-15T12:05:00.000Z",
    );
    const parsed = parseAppData({
      version: 1,
      settings: DEFAULT_APP_DATA.settings,
      walks: [completed],
    });
    expect(parsed.ok).toBe(true);
    expect(parsed.data.walks[0].status).toBe("completed");
    expect(parsed.data.walks[0].stateAfter).toBeUndefined();
    expect(parsed.data.walks[0].actualDurationSeconds).toBe(300);
    const summary = calculateHistorySummary(parsed.data.walks);
    expect(summary.momentsInterrupted).toBe(1);
    expect(summary.completedWithState).toBe(0);
    expect(summary.hasEnoughForFeelingSummary).toBe(false);
  });

  it("does not infer usefulness when users skip the optional pause rating", () => {
    const walks: WalkEvent[] = [
      walk({ id: "a", startedAt: "2026-01-01T10:00:00.000Z" }),
      walk({ id: "b", startedAt: "2026-01-02T10:00:00.000Z", usefulPause: "yes" }),
      walk({ id: "c", startedAt: "2026-01-03T10:00:00.000Z" }),
    ];
    const summary = calculateHistorySummary(walks);
    expect(summary.momentsInterrupted).toBe(3);
    expect(summary.completedWithPauseRating).toBe(1);
    expect(summary.usefulPauseCount).toBe(1);
    expect(summary.hasEnoughForPauseSummary).toBe(false);
  });

  it("includes a negative rating in the response denominator", () => {
    const summary = calculateHistorySummary([
      walk({ id: "a", startedAt: "2026-01-01T10:00:00.000Z", usefulPause: "no" }),
      walk({ id: "b", startedAt: "2026-01-02T10:00:00.000Z", usefulPause: "somewhat" }),
    ]);
    expect(summary.completedWithPauseRating).toBe(2);
    expect(summary.usefulPauseCount).toBe(1);
    expect(summary.hasEnoughForPauseSummary).toBe(true);
  });

  it("handles empty history carefully", () => {
    const summary = calculateHistorySummary([]);
    expect(summary.momentsInterrupted).toBe(0);
    expect(summary.hasEnoughForFeelingSummary).toBe(false);
    expect(summary.hasEnoughForPauseSummary).toBe(false);
  });

  it("does not claim feeling summary after one event", () => {
    const summary = calculateHistorySummary([
      walk({
        id: "1",
        startedAt: "2026-01-01T10:00:00.000Z",
        actualDurationSeconds: 600,
        stateAfter: "better",
      }),
    ]);
    expect(summary.hasEnoughForFeelingSummary).toBe(false);
  });

  it("sorts recent first", () => {
    const a = walk({ id: "a", startedAt: "2026-01-01T10:00:00.000Z" });
    const b = walk({ id: "b", startedAt: "2026-01-03T10:00:00.000Z" });
    expect(sortWalksRecentFirst([a, b]).map((w) => w.id)).toEqual(["b", "a"]);
  });
});

describe("duration presets and safe persistence", () => {
  it("preserves an existing walk duration independently of later setting changes", () => {
    const first = createWalkEvent({
      id: "dur-5",
      startedAt: "2026-07-15T12:00:00.000Z",
      targetDurationSeconds: 300,
    });
    const parsed = parseAppData({
      ...DEFAULT_APP_DATA,
      settings: { ...DEFAULT_APP_DATA.settings, defaultDurationSeconds: 1200 },
      walks: [first],
    });
    expect(parsed.ok).toBe(true);
    expect(parsed.data.settings.defaultDurationSeconds).toBe(1200);
    expect(parsed.data.walks[0].targetDurationSeconds).toBe(300);
    expect(getDisplaySeconds(first.startedAt, 300, Date.parse(first.startedAt) + 120_000))
      .toEqual({ mode: "countdown", seconds: 180 });
  });

  it("rejects non-finite and impossible default durations while retaining other settings", () => {
    for (const bad of [0, -1, 0.5, Infinity, 86400]) {
      const parsed = parseAppData({
        ...DEFAULT_APP_DATA,
        settings: {
          ...DEFAULT_APP_DATA.settings,
          onboardingCompleted: true,
          defaultDurationSeconds: bad,
        },
      });
      expect(parsed.data.settings.defaultDurationSeconds).toBe(600);
      expect(parsed.data.settings.onboardingCompleted).toBe(true);
    }
  });
});

describe("persistence serialization and parsing", () => {
  it("round-trips valid data", () => {
    const data = {
      ...DEFAULT_APP_DATA,
      settings: {
        ...DEFAULT_APP_DATA.settings,
        onboardingCompleted: true,
        implementationIntention: { preset: "spiraling" as const },
      },
      walks: [
        walk({
          id: "x",
          startedAt: "2026-01-01T10:00:00.000Z",
          actualDurationSeconds: 600,
          stateAfter: "better",
        }),
      ],
    };
    const parsed = parseAppData(JSON.parse(serializeAppData(data)));
    expect(parsed.ok).toBe(true);
    expect(parsed.data.walks).toHaveLength(1);
    expect(parsed.data.settings.onboardingCompleted).toBe(true);
  });

  it("recovers from corrupted data", () => {
    const bad = parseAppData("not-json-object" as unknown);
    expect(bad.ok).toBe(false);
    expect(bad.data.walks).toEqual([]);
  });

  it("drops invalid walks and collapses duplicate actives", () => {
    const parsed = parseAppData({
      version: 1,
      settings: { onboardingCompleted: true, defaultDurationSeconds: 600 },
      walks: [
        { bogus: true },
        createWalkEvent({
          id: "a1",
          startedAt: "2026-01-01T10:00:00.000Z",
          targetDurationSeconds: 600,
        }),
        createWalkEvent({
          id: "a2",
          startedAt: "2026-01-01T11:00:00.000Z",
          targetDurationSeconds: 600,
        }),
      ],
    });
    expect(parsed.ok).toBe(false);
    const actives = parsed.data.walks.filter((w) => w.status === "active");
    expect(actives).toHaveLength(1);
    expect(actives[0].id).toBe("a2");
  });
});
