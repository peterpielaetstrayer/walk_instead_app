"use client";

import { useRouter } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyState, Screen } from "@/components/ui";
import { WalkHistoryItem, WalkSummaryCard } from "@/components/WalkHistory";
import { formatDurationHuman } from "@/lib/format";
import {
  calculateHistorySummary,
  sortWalksRecentFirst,
} from "@/lib/walk-logic";
import { useWalkStore } from "@/lib/walk-store";

export default function HistoryPage() {
  return (
    <HydrationGate>
      <HistoryContent />
    </HydrationGate>
  );
}

function HistoryContent() {
  const router = useRouter();
  const { data, startWalk, activeWalk } = useWalkStore();
  const walks = sortWalksRecentFirst(data.walks);
  const summary = calculateHistorySummary(data.walks);

  const feelingLine = summary.hasEnoughForFeelingSummary
    ? `You felt better after ${summary.betterCount} of ${summary.completedWithState} walks.`
    : undefined;

  const pauseLine = summary.hasEnoughForPauseSummary
    ? `Your walks created a useful pause ${summary.usefulPauseCount} ${summary.usefulPauseCount === 1 ? "time" : "times"}.`
    : undefined;

  const timeLine =
    summary.momentsInterrupted > 0
      ? `Total walking time: ${formatDurationHuman(summary.totalWalkingSeconds)}`
      : undefined;

  const beginWalk = () => {
    if (activeWalk) {
      router.push("/walk");
      return;
    }
    startWalk();
    router.push("/walk");
  };

  return (
    <>
      <ScreenHeader title="My Walks" backHref="/" />
      <Screen>
        {walks.length === 0 ? (
          <EmptyState
            heading="Your evidence begins with one walk."
            body="The purpose is not to build a perfect streak. It is to notice what happens when you walk first."
            actionLabel="Walk Instead"
            onAction={beginWalk}
          />
        ) : (
          <>
            <WalkSummaryCard
              momentsInterrupted={summary.momentsInterrupted}
              feelingLine={feelingLine}
              pauseLine={pauseLine}
              timeLine={timeLine}
            />
            <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Recent walks
            </h2>
            <ul className="flex flex-col gap-2">
              {walks.map((walk) => (
                <li key={walk.id}>
                  <WalkHistoryItem walk={walk} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Screen>
    </>
  );
}
