"use client";

import Link from "next/link";
import {
  STATE_AFTER_LABELS,
  TRIGGER_LABELS,
  type WalkEvent,
} from "@/lib/types";
import { formatDurationHuman, formatWalkDateTime } from "@/lib/format";

export function WalkHistoryItem({ walk }: { walk: WalkEvent }) {
  const duration =
    walk.actualDurationSeconds != null
      ? formatDurationHuman(walk.actualDurationSeconds)
      : "In progress";

  const trigger =
    walk.trigger === "other" && walk.customTrigger
      ? walk.customTrigger
      : walk.trigger
        ? TRIGGER_LABELS[walk.trigger]
        : null;

  const state = walk.stateAfter ? STATE_AFTER_LABELS[walk.stateAfter] : null;

  const meta = [duration, trigger].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/history/${walk.id}`}
      className="block rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 hover:bg-white transition-colors min-h-16"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium">
            {formatWalkDateTime(walk.startedAt)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {meta}
            {walk.isPractice ? " · Practice" : ""}
            {walk.note ? " · Note" : ""}
          </p>
        </div>
        {state && (
          <span className="shrink-0 text-sm font-medium text-[var(--color-text-secondary)]">
            {state}
          </span>
        )}
      </div>
    </Link>
  );
}

export function WalkSummaryCard({
  momentsInterrupted,
  feelingLine,
  pauseLine,
  timeLine,
}: {
  momentsInterrupted: number;
  feelingLine?: string;
  pauseLine?: string;
  timeLine?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-lg font-semibold leading-snug">
        You have interrupted{" "}
        <span className="text-[var(--color-primary)]">{momentsInterrupted}</span>{" "}
        {momentsInterrupted === 1 ? "moment" : "moments"}.
      </p>
      {(feelingLine || pauseLine || timeLine) && (
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-secondary)]">
          {feelingLine && <li>{feelingLine}</li>}
          {pauseLine && <li>{pauseLine}</li>}
          {timeLine && <li>{timeLine}</li>}
        </ul>
      )}
    </div>
  );
}
