"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Footprints } from "lucide-react";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, TextLink } from "@/components/Buttons";
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
  const { data, startWalk, activeWalk, storageError } = useWalkStore();

  useEffect(() => {
    if (!data.settings.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [data.settings.onboardingCompleted, router]);

  if (!data.settings.onboardingCompleted) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      </div>
    );
  }

  const handleWalk = () => {
    if (activeWalk) {
      router.push("/walk");
      return;
    }
    startWalk();
    router.push("/walk");
  };

  return (
    <>
      <ScreenHeader title="" menuHref="/settings" />
      <Screen className="justify-between">
        <div className="flex flex-1 flex-col justify-center pt-4 pb-8">
          <p className="text-[2rem] font-bold tracking-tight leading-none">
            Walk Instead
          </p>
          <p className="mt-5 text-lg leading-snug text-[var(--color-text-secondary)] max-w-[18rem]">
            You do not have to decide right now.
            <br />
            Walk first.
          </p>

          {storageError && (
            <p
              className="mt-4 text-sm text-[var(--color-text-secondary)]"
              role="status"
            >
              {storageError}
            </p>
          )}

          <div className="mt-10">
            <PrimaryButton
              onClick={handleWalk}
              className="min-h-16 text-lg tracking-wide"
              aria-label="Walk Instead"
            >
              <Footprints className="h-5 w-5" aria-hidden />
              WALK INSTEAD
            </PrimaryButton>
          </div>

          <div className="mt-4 flex justify-center">
            <TextLink onClick={() => router.push("/history")}>
              See my walks
            </TextLink>
          </div>
        </div>

        <SafetyNote className="mb-2" />
      </Screen>
    </>
  );
}
