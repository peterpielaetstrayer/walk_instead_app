"use client";

import { useRouter } from "next/navigation";
import { Footprints } from "lucide-react";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/Buttons";
import { SafetyNote, Screen } from "@/components/ui";
import { useWalkStore } from "@/lib/walk-store";

export default function HomePage() {
  return (
    <HydrationGate>
      <HomeContent />
    </HydrationGate>
  );
}

function HomeContent() {
  const router = useRouter();
  const { activeWalk, startWalk, storageError, data } = useWalkStore();

  // No onboarding, context picker, account or route choice can block a first walk.
  const begin = () => {
    if (!activeWalk) startWalk();
    router.push("/walk");
  };

  return (
    <>
      <ScreenHeader title="" menuHref="/settings" />
      <Screen className="justify-between">
        <div className="flex flex-1 flex-col justify-center pt-10 pb-12">
          <p className="text-[11px] font-semibold tracking-[0.19em] text-[var(--color-text-secondary)]">
            WALK INSTEAD
          </p>
          <h1 className="editorial-heading mt-12 max-w-sm text-[clamp(2.65rem,10vw,3.3rem)] leading-[1.12] tracking-[-0.025em]">
            You don&apos;t have to decide yet.
          </h1>
          <p className="mt-6 max-w-xs text-[17px] leading-[1.6] text-[var(--color-text-secondary)]">
            Begin with a walk. Return when you&apos;re ready.
          </p>

          <div className="mt-12">
            <PrimaryButton
              onClick={begin}
              className="min-h-16 text-[17px]"
              aria-label={activeWalk ? "Return to your walk" : "Begin a walk now"}
            >
              <Footprints aria-hidden className="h-5 w-5" />
              {activeWalk ? "Return to my walk" : "Begin walking"}
            </PrimaryButton>
            <p className="mt-3 text-center text-[13px] text-[var(--color-text-muted)]">
              {Math.round((activeWalk?.targetDurationSeconds ?? data.settings.defaultDurationSeconds) / 60)} minutes · No route required
            </p>
          </div>

          {storageError && (
            <p className="mt-5 text-sm text-[var(--color-text-secondary)]" role="status">
              {storageError}
            </p>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 pb-2">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.push("/history")}
              className="min-h-11 text-sm font-medium underline-offset-4 hover:underline"
            >
              See my walks
            </button>
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="min-h-11 text-sm font-medium underline-offset-4 hover:underline"
            >
              Personalize later
            </button>
          </div>
          <SafetyNote className="mt-2" />
        </div>
      </Screen>
    </>
  );
}
