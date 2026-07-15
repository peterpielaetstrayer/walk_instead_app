"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, SecondaryButton, TextLink } from "@/components/Buttons";
import { ProgressTimer } from "@/components/ProgressTimer";
import { TriggerSelector } from "@/components/Selectors";
import { BottomSheet, ConfirmationDialog } from "@/components/Dialog";
import { Screen } from "@/components/ui";
import { formatStaleWalkLabel } from "@/lib/format";
import { getRecoveryAction, isTargetReached } from "@/lib/walk-logic";
import { useWalkStore } from "@/lib/walk-store";
import type { WalkTrigger } from "@/lib/types";

function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 1000);
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

function getClockSnapshot() {
  return Date.now();
}

function getClockServerSnapshot() {
  return 0;
}

function useClock() {
  return useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );
}

export default function WalkPage() {
  return (
    <HydrationGate>
      <WalkContent />
    </HydrationGate>
  );
}

function WalkContent() {
  const router = useRouter();
  const {
    activeWalk,
    setWalkTrigger,
    endActiveWalkForCheckIn,
    abandonWalk,
    deleteWalk,
  } = useWalkStore();

  const now = useClock();
  const [endConfirm, setEndConfirm] = useState(false);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [keepWalking, setKeepWalking] = useState(false);
  const [customTrigger, setCustomTrigger] = useState(
    () => activeWalk?.customTrigger ?? "",
  );

  if (!activeWalk) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-[var(--color-text-muted)]">
          No active walk.
        </p>
        <PrimaryButton onClick={() => router.replace("/")}>
          Back home
        </PrimaryButton>
      </div>
    );
  }

  const recovery = getRecoveryAction(activeWalk, now);
  const targetDone = isTargetReached(
    activeWalk.startedAt,
    activeWalk.targetDurationSeconds,
    now,
  );
  const showCompletePrompt = targetDone && !keepWalking && recovery !== "stale";
  const statusAnnounce = showCompletePrompt
    ? "Ten minutes complete. Keep walking or check in."
    : "";

  const goCheckIn = () => {
    endActiveWalkForCheckIn(activeWalk.id);
    router.push(`/check-in?id=${activeWalk.id}`);
  };

  if (recovery === "stale") {
    return (
      <>
        <ScreenHeader
          onClose={() => router.push("/")}
          trailing={<span className="w-11" />}
        />
        <Screen className="justify-center">
          <h1 className="text-[1.75rem] font-bold tracking-tight">
            Unfinished walk
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
            You have an unfinished walk from{" "}
            {formatStaleWalkLabel(activeWalk.startedAt)}.
          </p>
          <div className="mt-8 flex flex-col gap-2">
            <PrimaryButton onClick={goCheckIn}>Complete check-in</PrimaryButton>
            <SecondaryButton
              onClick={() => {
                abandonWalk(activeWalk.id);
                router.replace("/");
              }}
            >
              Mark as unfinished
            </SecondaryButton>
            <SecondaryButton
              onClick={() => {
                deleteWalk(activeWalk.id);
                router.replace("/");
              }}
            >
              Delete event
            </SecondaryButton>
          </div>
        </Screen>
      </>
    );
  }

  return (
    <>
      <ScreenHeader onClose={() => router.push("/")} menuHref="/settings" />
      <Screen className="items-center text-center">
        <div aria-live="polite" className="sr-only">
          {statusAnnounce}
        </div>

        {showCompletePrompt ? (
          <>
            <h1 className="mt-4 text-[1.9rem] font-bold tracking-tight">
              Ten minutes complete.
            </h1>
            <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
              Keep walking or check in.
            </p>
            <div className="mt-8 w-full max-w-sm flex justify-center">
              <ProgressTimer
                startedAt={activeWalk.startedAt}
                targetDurationSeconds={activeWalk.targetDurationSeconds}
              />
            </div>
            <div className="mt-8 w-full flex flex-col gap-2">
              <PrimaryButton onClick={goCheckIn}>Check in</PrimaryButton>
              <SecondaryButton onClick={() => setKeepWalking(true)}>
                Keep walking
              </SecondaryButton>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight">
              You chose to walk first.
            </h1>
            <div className="mt-8 flex justify-center">
              <ProgressTimer
                startedAt={activeWalk.startedAt}
                targetDurationSeconds={activeWalk.targetDurationSeconds}
              />
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Put your phone away.
              <br />
              Come back when you are ready.
            </p>

            <div className="mt-auto w-full pt-10 flex flex-col gap-3 items-center">
              <SecondaryButton onClick={() => setEndConfirm(true)}>
                End walk
              </SecondaryButton>
              <TextLink
                onClick={() => {
                  setCustomTrigger(activeWalk.customTrigger ?? "");
                  setTriggerOpen(true);
                }}
              >
                What am I walking instead of?
              </TextLink>
              {targetDone && (
                <PrimaryButton onClick={goCheckIn}>Check in</PrimaryButton>
              )}
            </div>
          </>
        )}
      </Screen>

      <ConfirmationDialog
        open={endConfirm}
        title="End walk?"
        onClose={() => setEndConfirm(false)}
        actions={
          <>
            <PrimaryButton
              onClick={() => {
                setEndConfirm(false);
                goCheckIn();
              }}
            >
              End walk now
            </PrimaryButton>
            <SecondaryButton onClick={() => setEndConfirm(false)}>
              Keep walking
            </SecondaryButton>
          </>
        }
      >
        No pressure. You walked before deciding.
      </ConfirmationDialog>

      <BottomSheet
        open={triggerOpen}
        title="What am I walking instead of?"
        onClose={() => setTriggerOpen(false)}
      >
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Optional. Selecting a trigger does not pause your walk.
        </p>
        <TriggerSelector
          value={activeWalk.trigger}
          customText={customTrigger}
          onChange={(trigger: WalkTrigger) => {
            setWalkTrigger(
              activeWalk.id,
              trigger,
              trigger === "other" ? customTrigger : undefined,
            );
          }}
          onCustomTextChange={(text) => {
            setCustomTrigger(text);
            if (activeWalk.trigger === "other") {
              setWalkTrigger(activeWalk.id, "other", text);
            }
          }}
        />
        <div className="mt-5">
          <PrimaryButton onClick={() => setTriggerOpen(false)}>
            Done
          </PrimaryButton>
        </div>
      </BottomSheet>
    </>
  );
}
