"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, SecondaryButton, TextLink } from "@/components/Buttons";
import {
  OutcomeSelector,
  UsefulPauseSelector,
} from "@/components/Selectors";
import { Screen } from "@/components/ui";
import { useWalkStore } from "@/lib/walk-store";
import type { StateAfter, UsefulPause } from "@/lib/types";

export default function CheckInPage() {
  return (
    <HydrationGate>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
          </div>
        }
      >
        <CheckInContent />
      </Suspense>
    </HydrationGate>
  );
}

function CheckInContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { getWalk, completeWalkCheckIn, activeWalk } = useWalkStore();

  const id = params.get("id") ?? activeWalk?.id;
  const walk = id ? getWalk(id) : undefined;

  const [stateAfter, setStateAfter] = useState<StateAfter | undefined>(
    () => walk?.stateAfter,
  );
  const [usefulPause, setUsefulPause] = useState<UsefulPause | undefined>(
    () => walk?.usefulPause,
  );

  if (!id || !walk) {
    return (
      <Screen className="justify-center">
        <p className="text-[var(--color-text-secondary)]">
          This walk could not be found.
        </p>
        <PrimaryButton className="mt-6" onClick={() => router.push("/")}>
          Back home
        </PrimaryButton>
      </Screen>
    );
  }

  const finish = (goReflect: boolean) => {
    if (!stateAfter) return;
    completeWalkCheckIn(walk.id, {
      stateAfter,
      usefulPause,
      note: walk.note,
    });
    if (goReflect) {
      router.push(`/reflection?id=${walk.id}`);
    } else {
      router.push("/");
    }
  };

  const showSecondStep = Boolean(stateAfter);

  return (
    <>
      <ScreenHeader backHref="/" trailing={<span className="w-11" />} />
      <Screen>
        <h1 className="text-[1.9rem] font-bold tracking-tight">
          How are you now?
        </h1>
        {!showSecondStep ? (
          <>
            <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
              Choose the option that fits best right now.
            </p>
            <div className="mt-6">
              <OutcomeSelector value={stateAfter} onChange={setStateAfter} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-4">
              <OutcomeSelector value={stateAfter} onChange={setStateAfter} />
            </div>

            <h2 className="mt-8 text-lg font-semibold">
              Did the walk create a useful pause?
            </h2>
            <div className="mt-3">
              <UsefulPauseSelector
                value={usefulPause}
                onChange={setUsefulPause}
              />
            </div>
            <div className="mt-2">
              <TextLink onClick={() => setUsefulPause(undefined)}>
                Skip
              </TextLink>
            </div>

            <div className="mt-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-lg font-semibold">
                You walked before deciding.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <PrimaryButton onClick={() => finish(false)}>Finish</PrimaryButton>
              <SecondaryButton onClick={() => finish(true)}>
                Add a note
              </SecondaryButton>
            </div>
          </>
        )}
      </Screen>
    </>
  );
}
