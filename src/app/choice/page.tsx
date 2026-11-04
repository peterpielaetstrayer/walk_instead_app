"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, SecondaryButton, TextLink } from "@/components/Buttons";
import { Screen } from "@/components/ui";
import { useWalkStore } from "@/lib/walk-store";

export default function ChoicePage() {
  return (
    <HydrationGate>
      <Suspense fallback={<p className="p-6 text-sm">Loading…</p>}>
        <ChoiceContent />
      </Suspense>
    </HydrationGate>
  );
}

function ChoiceContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { getWalk, startWalk } = useWalkStore();
  const id = params.get("id");
  const walk = id ? getWalk(id) : undefined;

  if (!walk || walk.status !== "completed") {
    return (
      <Screen className="justify-center">
        <h1 className="editorial-heading text-3xl">Your next step is yours.</h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          Finish your walk first, or start again from home.
        </p>
        <PrimaryButton className="mt-8" onClick={() => router.replace("/")}>
          Return home
        </PrimaryButton>
      </Screen>
    );
  }

  const anotherPause = () => {
    startWalk();
    router.push("/walk");
  };

  return (
    <>
      <ScreenHeader backHref="/" trailing={<span className="w-11" aria-hidden />} />
      <Screen className="justify-between pt-14">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.17em] text-[var(--color-text-muted)]">
            YOUR NEXT STEP
          </p>
          <h1 className="editorial-heading mt-9 text-[clamp(2.5rem,9vw,3.3rem)] leading-[1.14]">
            You made some space.
          </h1>
          <p className="mt-6 max-w-xs text-[17px] leading-relaxed text-[var(--color-text-secondary)]">
            Whatever you&apos;re feeling, what comes next is your choice.
          </p>
        </div>

        <div className="pb-4">
          <PrimaryButton onClick={() => router.replace("/")} className="min-h-14">
            Return to my day
          </PrimaryButton>
          <SecondaryButton onClick={anotherPause} className="mt-3 min-h-14">
            Take another pause
          </SecondaryButton>
          <div className="mt-3 flex justify-center">
            <TextLink onClick={() => router.push(`/reflection?id=${encodeURIComponent(walk.id)}`)}>
              Save a thought
            </TextLink>
          </div>
          <p className="mt-12 text-center text-[13px] text-[var(--color-text-muted)]">
            No score. No streak. No judgment.
          </p>
        </div>
      </Screen>
    </>
  );
}
