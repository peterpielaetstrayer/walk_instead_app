"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { ConfirmationDialog } from "@/components/Dialog";
import { Card, Screen } from "@/components/ui";
import { DURATION_PRESETS_SECONDS, INTENTION_PRESETS, type IntentionPreset } from "@/lib/types";
import { buildIntentionStatement } from "@/lib/walk-logic";
import { useWalkStore } from "@/lib/walk-store";

export default function SettingsPage() {
  return (
    <HydrationGate>
      <SettingsContent />
    </HydrationGate>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { data, updateSettings, exportJson, deleteAllData } = useWalkStore();
  const intention = data.settings.implementationIntention;
  const [editing, setEditing] = useState(false);
  const [preset, setPreset] = useState<IntentionPreset | undefined>();
  const [customText, setCustomText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statement = buildIntentionStatement({
    preset: intention?.preset,
    customText: intention?.customText,
  });

  const openEditor = () => {
    setPreset(intention?.preset);
    setCustomText(intention?.customText ?? "");
    setEditing(true);
  };

  const handleExport = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `walk-instead-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ScreenHeader title="Settings" backHref="/" />
      <Screen className="gap-8">
        <section>
          <fieldset>
            <legend className="text-lg font-semibold">Default walk length</legend>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Choose this while you&apos;re calm. A walk already in progress keeps
              its original time; you can still finish early or keep going.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {DURATION_PRESETS_SECONDS.map((seconds) => (
                <label key={seconds} className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="default-walk-duration"
                    value={seconds}
                    checked={data.settings.defaultDurationSeconds === seconds}
                    onChange={() => updateSettings({ defaultDurationSeconds: seconds })}
                  />
                  <span className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary-subtle)] peer-checked:text-[var(--color-primary)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-primary)]">
                    {seconds / 60} min
                  </span>
                </label>
              ))}
            </div>
            {!DURATION_PRESETS_SECONDS.includes(data.settings.defaultDurationSeconds) && (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Current custom default: {Math.round(data.settings.defaultDurationSeconds / 60)} minutes.
                Choose a standard option above to change it.
              </p>
            )}
          </fieldset>
        </section>

        <section>
          <h2 className="text-lg font-semibold">My intention</h2>
          <Card className="mt-3">
            <p className="text-[15px] leading-relaxed">{statement}</p>
          </Card>
          <div className="mt-3">
            <SecondaryButton onClick={openEditor}>Edit intention</SecondaryButton>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data and privacy</h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
            <li>No account is required.</li>
            <li>Walk information is stored locally on the device.</li>
            <li>Notes are not transmitted.</li>
            <li>
              Clearing browser data or uninstalling the PWA may remove local
              records.
            </li>
            <li>This prototype does not synchronize across devices.</li>
          </ul>
          <div className="mt-4 flex flex-col gap-2">
            <SecondaryButton onClick={handleExport}>
              Export data as JSON
            </SecondaryButton>
            <SecondaryButton onClick={() => setConfirmDelete(true)}>
              Delete all data
            </SecondaryButton>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Safety</h2>
          <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
            <p>
              Walk Instead is a personal reflection tool, not medical care,
              therapy, substance-use treatment, crisis support, or emergency
              assistance.
            </p>
            <p>
              Only walk when your surroundings, health, weather, and
              circumstances make it safe.
            </p>
            <p>
              Do not use the app while driving or in any situation requiring
              your full attention.
            </p>
          </div>
        </section>

        <p className="text-center text-xs text-[var(--color-text-muted)] pb-4">
          Walk Instead v0.2 design draft · Walk first. Decide afterward.
        </p>
      </Screen>

      <ConfirmationDialog
        open={editing}
        title="Edit intention"
        onClose={() => setEditing(false)}
        actions={
          <>
            <PrimaryButton
              onClick={() => {
                if (!preset) return;
                updateSettings({
                  implementationIntention: {
                    preset,
                    customText: customText.trim() || undefined,
                  },
                });
                setEditing(false);
              }}
              disabled={!preset || (preset === "other" && !customText.trim())}
            >
              Save
            </PrimaryButton>
            <SecondaryButton onClick={() => setEditing(false)}>
              Cancel
            </SecondaryButton>
          </>
        }
      >
        <p className="mb-3 text-sm">When I notice myself…</p>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {INTENTION_PRESETS.map((option) => {
            const selected = preset === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setPreset(option)}
                className={`min-h-11 w-full rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm capitalize ${
                  selected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {preset === "other" && (
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="mt-3 w-full min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 text-sm"
            placeholder="Your words"
            maxLength={80}
            aria-label="Custom intention"
          />
        )}
      </ConfirmationDialog>

      <ConfirmationDialog
        open={confirmDelete}
        title="Delete all data?"
        onClose={() => setConfirmDelete(false)}
        actions={
          <>
            <PrimaryButton
              onClick={() => {
                deleteAllData();
                setConfirmDelete(false);
                router.replace("/");
              }}
            >
              Delete everything
            </PrimaryButton>
            <SecondaryButton onClick={() => setConfirmDelete(false)}>
              Keep my data
            </SecondaryButton>
          </>
        }
      >
        This clears walks, notes, and settings on this device and returns you
        to the home screen. It cannot be undone.
      </ConfirmationDialog>
    </>
  );
}
