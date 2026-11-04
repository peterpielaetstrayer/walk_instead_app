"use client";

import { useClock } from "@/lib/useClock";
import { formatTimerDisplay } from "@/lib/format";
import { getDisplaySeconds, getTimerProgress } from "@/lib/walk-logic";

export function ProgressTimer({
  startedAt,
  targetDurationSeconds,
}: {
  startedAt: string;
  targetDurationSeconds: number;
}) {
  const now = useClock();
  const display = getDisplaySeconds(startedAt, targetDurationSeconds, now);
  const progress = getTimerProgress(startedAt, targetDurationSeconds, now);
  const seconds = formatTimerDisplay(display.seconds);
  const remaining = display.mode !== "overtime";
  const progressPercent = Math.round(progress * 100);

  return (
    <div className="w-full" aria-label="Walk timer">
      <p className="editorial-heading text-center text-[clamp(4.5rem,20vw,6rem)] leading-none tabular-nums tracking-[-0.03em]" aria-hidden>
        {seconds}
      </p>
      <p className="mt-3 text-center text-[13px] text-[var(--color-text-muted)]" aria-hidden>
        {remaining ? "remaining" : "elapsed"}
      </p>
      <div
        className="mt-8 h-[5px] w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="progressbar"
        aria-label="Walk progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
      >
        <div
          className="h-full rounded-full bg-[var(--color-primary)] motion-reduce:transition-none transition-[width] duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="sr-only" aria-live="off">
        {remaining ? `${seconds} remaining` : `${seconds} elapsed`}
      </p>
    </div>
  );
}
