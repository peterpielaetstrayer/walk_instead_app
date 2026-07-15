"use client";

import { useSyncExternalStore } from "react";
import { formatTimerDisplay } from "@/lib/format";
import {
  getDisplaySeconds,
  getTimerProgress,
  isTargetReached,
} from "@/lib/walk-logic";

function subscribeTick(cb: () => void) {
  const id = window.setInterval(cb, 250);
  const onVis = () => {
    if (document.visibilityState === "visible") cb();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", cb);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", cb);
  };
}

function getNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

export function ProgressTimer({
  startedAt,
  targetDurationSeconds,
  size = 240,
}: {
  startedAt: string;
  targetDurationSeconds: number;
  size?: number;
}) {
  const now = useSyncExternalStore(subscribeTick, getNow, getServerNow);

  const display = getDisplaySeconds(startedAt, targetDurationSeconds, now);
  const progress = getTimerProgress(startedAt, targetDurationSeconds, now);
  const complete = isTargetReached(startedAt, targetDurationSeconds, now);
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const statusLabel = complete
    ? display.mode === "overtime"
      ? `Elapsed ${formatTimerDisplay(display.seconds)}`
      : "Ten minutes complete"
    : `${formatTimerDisplay(display.seconds)} remaining`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p
          className="text-[3.25rem] leading-none font-bold tracking-tight tabular-nums"
          aria-hidden
        >
          {formatTimerDisplay(display.seconds)}
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]" aria-hidden>
          {display.mode === "overtime" ? "elapsed" : "remaining"}
        </p>
      </div>
      <span className="sr-only" aria-live="off">
        Timer: {statusLabel}
      </span>
    </div>
  );
}
