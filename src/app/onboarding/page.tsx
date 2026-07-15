"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, TextLink } from "@/components/Buttons";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PathIllustration } from "@/components/Illustration";
import { Card, Screen } from "@/components/ui";
import { INTENTION_PRESETS, type IntentionPreset } from "@/lib/types";
import { buildIntentionStatement } from "@/lib/walk-logic";
import { useWalkStore } from "@/lib/walk-store";

export default function OnboardingPage() {
  return (
    <HydrationGate>
      <OnboardingContent />
    </HydrationGate>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const { data, updateSettings, completeOnboarding, startWalk } =
    useWalkStore();
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState<IntentionPreset | undefined>(
    data.settings.implementationIntention?.preset,
  );
  const [customText, setCustomText] = useState(
    data.settings.implementationIntention?.customText ?? "",
  );

  useEffect(() => {
    if (data.settings.onboardingCompleted) {
      router.replace("/");
    }
  }, [data.settings.onboardingCompleted, router]);

  if (data.settings.onboardingCompleted) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      </div>
    );
  }

  const intention = buildIntentionStatement({ preset, customText });

  const finishAndHome = () => {
    updateSettings({
      implementationIntention: {
        preset,
        customText: customText.trim() || undefined,
      },
    });
    completeOnboarding();
    router.replace("/");
  };

  const startPractice = () => {
    updateSettings({
      implementationIntention: {
        preset,
        customText: customText.trim() || undefined,
      },
    });
    completeOnboarding();
    startWalk({ isPractice: true });
    router.replace("/walk");
  };

  return (
    <>
      <ScreenHeader
        onClose={step > 0 ? () => setStep((s) => Math.max(0, s - 1)) : undefined}
        trailing={<span className="w-11" aria-hidden />}
      />
      <Screen>
        {step === 0 && (
          <div className="flex flex-1 flex-col pt-2">
            <PathIllustration className="mb-6" />
            <h1 className="text-[1.9rem] font-bold tracking-tight leading-tight">
              Before you decide, walk.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Walk Instead is a simple tool for cravings, spirals, scrolling
              loops, stuck moments, and other times when movement might help.
            </p>
            <div className="mt-auto pt-8">
              <PrimaryButton onClick={() => setStep(1)}>Continue</PrimaryButton>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-1 flex-col pt-2">
            <h1 className="text-[1.9rem] font-bold tracking-tight leading-tight">
              Choose one moment to notice.
            </h1>
            <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
              When I notice myself…
            </p>
            <div className="mt-5 flex flex-col gap-2" role="radiogroup">
              {INTENTION_PRESETS.map((option) => {
                const selected = preset === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPreset(option)}
                    className={`min-h-12 w-full rounded-[var(--radius-md)] border px-4 py-3 text-left text-[15px] font-medium capitalize ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {preset === "other" && (
              <label className="mt-3 block">
                <span className="sr-only">Custom moment</span>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Describe the moment"
                  maxLength={80}
                  className="w-full min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 text-[15px]"
                />
              </label>
            )}
            <div className="mt-auto pt-8">
              <PrimaryButton
                onClick={() => {
                  if (!preset) return;
                  updateSettings({
                    implementationIntention: {
                      preset,
                      customText: customText.trim() || undefined,
                    },
                  });
                  setStep(2);
                }}
                disabled={!preset || (preset === "other" && !customText.trim())}
              >
                Continue
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-1 flex-col pt-2">
            <h1 className="text-[1.9rem] font-bold tracking-tight leading-tight">
              Here is your intention:
            </h1>
            <Card className="mt-6 bg-[var(--color-primary-subtle)] border-[var(--color-primary)]/20">
              <p className="text-base leading-relaxed font-medium">{intention}</p>
            </Card>
            <div className="mt-auto pt-8">
              <InstallPrompt
                onContinue={() => setStep(3)}
                onDismissed={() =>
                  updateSettings({ installPromptDismissed: true })
                }
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col pt-2">
            <h1 className="text-[1.9rem] font-bold tracking-tight leading-tight">
              Take one practice walk.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Practice using Walk Instead before you truly need it.
            </p>
            <div className="mt-auto pt-8 space-y-3">
              <PrimaryButton onClick={startPractice}>
                Start a practice walk
              </PrimaryButton>
              <div className="flex justify-center">
                <TextLink onClick={finishAndHome}>Do this later</TextLink>
              </div>
            </div>
          </div>
        )}
      </Screen>
    </>
  );
}
