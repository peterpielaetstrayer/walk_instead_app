"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, TextLink } from "@/components/Buttons";
import { OutcomeSelector, UsefulPauseSelector } from "@/components/Selectors";
import { Screen } from "@/components/ui";
import { useWalkStore } from "@/lib/walk-store";
import type { StateAfter, UsefulPause } from "@/lib/types";

export default function CheckInPage() {
  return (
    <HydrationGate>
      <Suspense fallback={<p className="p-6 text-sm">Loading…</p>}>
        <CheckInContent />
      </Suspense>
    </HydrationGate>
  );
}

function CheckInContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { getWalk, activeWalk, completeWalkCheckIn, endActiveWalkForCheckIn } = useWalkStore();
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
        <h1 className="editorial-heading text-3xl">This walk could not be found.</h1>
        <PrimaryButton className="mt-6" onClick={() => router.replace("/")}>
          Return home
        </PrimaryButton>
      </Screen>
    );
  }

  const next = () => {
    // Either feeling rating is optional; no false "positive" default.
    completeWalkCheckIn(walk.id, { stateAfter, usefulPause, note: walk.note });
    router.push(`/choice?id=${encodeURIComponent(walk.id)}`);
  };

  const skip = () => {
    // A walk can be completed without an emotional rating or reflection.
    endActiveWalkForCheckIn(walk.id);
    router.push(`/choice?id=${encodeURIComponent(walk.id)}`);
  };

  return (
    <>
      <ScreenHeader backHref="/" trailing={<span className="w-11" aria-hidden />} />
      <Screen className="pt-10">
        <p className="text-[11px] font-semibold tracking-[0.17em] text-[var(--color-text-muted)]">
          RETURN & NOTICE
        </p>
        <h1 className="editorial-heading mt-8 text-[clamp(2.45rem,9vw,3.2rem)] leading-[1.14]">
          Notice what changed.
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-[var(--color-text-secondary)]">
          There&apos;s no right answer.
        </p>
        <div className="mt-10">
          <OutcomeSelector value={stateAfter} onChange={setStateAfter} />
        </div>

        <details className="mt-8 text-sm text-[var(--color-text-secondary)]">
          <summary className="min-h-11 cursor-pointer py-3 font-medium">
            Was this a useful pause? (optional)
          </summary>
          <div className="mt-3">
            <UsefulPauseSelector value={usefulPause} onChange={setUsefulPause} />
          </div>
        </details>

        <div className="mt-auto pt-12 pb-4">
          <PrimaryButton className="min-h-14" onClick={next}>Continue</PrimaryButton>
          <div className="mt-3 flex justify-center">
            <TextLink onClick={skip}>Skip check-in</TextLink>
          </div>
        </div>
      </Screen>
    </>
  );
}
