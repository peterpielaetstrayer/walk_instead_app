"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, SecondaryButton, TextLink } from "@/components/Buttons";
import { ProgressTimer } from "@/components/ProgressTimer";
import { BottomSheet, ConfirmationDialog } from "@/components/Dialog";
import { Screen } from "@/components/ui";
import { formatStaleWalkLabel } from "@/lib/format";
import { getRecoveryAction, isTargetReached } from "@/lib/walk-logic";
import { useWalkStore } from "@/lib/walk-store";

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

function useClock() {
  return useSyncExternalStore(subscribeClock, () => Date.now(), () => 0);
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
    updateWalk,
    endActiveWalkForCheckIn,
    abandonWalk,
    deleteWalk,
  } = useWalkStore();

  const now = useClock();
  const [endConfirm, setEndConfirm] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [draftThought, setDraftThought] = useState("");
  const [keepWalking, setKeepWalking] = useState(false);

  if (!activeWalk) {
    return (
      <Screen className="justify-center">
        <p className="editorial-heading text-3xl">No walk is active.</p>
        <PrimaryButton className="mt-6" onClick={() => router.replace("/")}>
          Return home
        </PrimaryButton>
      </Screen>
    );
  }

  const recovery = getRecoveryAction(activeWalk, now);
  const targetReached = isTargetReached(
    activeWalk.startedAt,
    activeWalk.targetDurationSeconds,
    now,
  );
  const suggestCheckIn = targetReached && !keepWalking && recovery !== "stale";

  const goCheckIn = () => {
    endActiveWalkForCheckIn(activeWalk.id);
    router.push(`/check-in?id=${encodeURIComponent(activeWalk.id)}`);
  };

  const openThought = () => {
    setDraftThought(activeWalk.note ?? "");
    setThoughtOpen(true);
  };

  const saveThought = () => {
    updateWalk(activeWalk.id, { note: draftThought.trim() || undefined });
    setThoughtOpen(false);
  };

  if (recovery === "stale") {
    return (
      <>
        <ScreenHeader onClose={() => router.push("/")} trailing={<span className="w-11" />} />
        <Screen className="justify-center">
          <h1 className="editorial-heading text-3xl">An unfinished walk.</h1>
          <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
            You started a walk {formatStaleWalkLabel(activeWalk.startedAt)}.
            Choose how to close it. Nothing is counted without your input.
          </p>
          <div className="mt-9 flex flex-col gap-3">
            <PrimaryButton onClick={goCheckIn}>Finish and check in</PrimaryButton>
            <SecondaryButton
              onClick={() => {
                abandonWalk(activeWalk.id);
                router.replace("/");
              }}
            >
              Mark as unfinished
            </SecondaryButton>
            <TextLink
              onClick={() => {
                deleteWalk(activeWalk.id);
                router.replace("/");
              }}
            >
              Delete this walk
            </TextLink>
          </div>
        </Screen>
      </>
    );
  }

  return (
    <>
      <ScreenHeader onClose={() => router.push("/")} menuHref="/settings" />
      <Screen className="pt-10">
        <div aria-live="polite" className="sr-only">
          {suggestCheckIn ? "Ten minutes complete. You can check in or keep walking." : ""}
        </div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--color-text-muted)]">
          WALK IN PROGRESS
        </p>
        <h1 className="editorial-heading mt-9 text-[clamp(2rem,8vw,2.65rem)] leading-[1.19]">
          {suggestCheckIn ? "Your pause is yours." : "The pause has begun."}
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-[var(--color-text-secondary)]">
          {suggestCheckIn
            ? "You can keep walking or return when you're ready."
            : "Keep moving. Nothing needs to be solved right now."}
        </p>

        <div className="mt-20">
          <ProgressTimer
            startedAt={activeWalk.startedAt}
            targetDurationSeconds={activeWalk.targetDurationSeconds}
          />
        </div>
        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Put your phone away when it&apos;s safe to do so.
        </p>

        <div className="mt-auto pb-6 pt-16">
          {suggestCheckIn ? (
            <>
              <PrimaryButton className="min-h-14" onClick={goCheckIn}>
                Check in
              </PrimaryButton>
              <SecondaryButton className="mt-3 min-h-14" onClick={() => setKeepWalking(true)}>
                Keep walking
              </SecondaryButton>
            </>
          ) : (
            <SecondaryButton className="min-h-14" onClick={openThought}>
              {activeWalk.note ? "Edit saved thought" : "Save a thought"}
            </SecondaryButton>
          )}
          {suggestCheckIn ? (
            <div className="mt-3 flex justify-center">
              <TextLink onClick={openThought}>Save a thought</TextLink>
            </div>
          ) : (
            <div className="mt-3 flex justify-center">
              <TextLink onClick={() => setEndConfirm(true)}>Finish early</TextLink>
            </div>
          )}
          <p className="mt-6 text-center text-[13px] text-[var(--color-text-muted)]">
            You can always choose what comes next.
          </p>
        </div>
      </Screen>

      <ConfirmationDialog
        open={endConfirm}
        title="Finish this walk?"
        onClose={() => setEndConfirm(false)}
        actions={
          <>
            <PrimaryButton onClick={() => { setEndConfirm(false); goCheckIn(); }}>
              Finish now
            </PrimaryButton>
            <SecondaryButton onClick={() => setEndConfirm(false)}>
              Keep walking
            </SecondaryButton>
          </>
        }
      >
        No minimum time. A short pause still counts as a choice to interrupt.
      </ConfirmationDialog>

      <BottomSheet open={thoughtOpen} title="Keep the thought" onClose={() => setThoughtOpen(false)}>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Optional. Your walk timer continues while this is open.
          Save a short note only when it is safe to stop and use your phone.
        </p>
        <label className="block text-sm font-medium" htmlFor="walk-thought">
          What came to mind?
        </label>
        <textarea
          id="walk-thought"
          rows={5}
          maxLength={2000}
          value={draftThought}
          onChange={(e) => setDraftThought(e.target.value)}
          placeholder="A thought, a feeling, or an idea…"
          className="mt-2 w-full min-h-32 resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base"
        />
        <p className="mt-2 mb-5 text-xs text-[var(--color-text-muted)]">
          Stored on this device. No recording or sharing.
        </p>
        <PrimaryButton onClick={saveThought}>Save and return to my walk</PrimaryButton>
        <div className="mt-2 flex justify-center">
          <TextLink onClick={() => setThoughtOpen(false)}>Keep walking without saving</TextLink>
        </div>
      </BottomSheet>
    </>
  );
}
