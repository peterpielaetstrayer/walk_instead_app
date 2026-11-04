"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, TextLink } from "@/components/Buttons";
import { Screen } from "@/components/ui";
import { useWalkStore } from "@/lib/walk-store";

const DRAFT_KEY = "walk-instead:reflection-draft:";

function readInitialNote(id: string, existing?: string) {
  try {
    const draft = window.sessionStorage.getItem(DRAFT_KEY + id);
    if (draft != null) return draft;
  } catch {
    /* ignore */
  }
  return existing ?? "";
}

export default function ReflectionPage() {
  return (
    <HydrationGate>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
          </div>
        }
      >
        <ReflectionContent />
      </Suspense>
    </HydrationGate>
  );
}

function ReflectionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { getWalk, updateWalk } = useWalkStore();
  const id = params.get("id");
  const walk = id ? getWalk(id) : undefined;
  const [note, setNote] = useState(() =>
    id ? readInitialNote(id, walk?.note) : "",
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

  const updateNote = (value: string) => {
    setNote(value);
    try {
      window.sessionStorage.setItem(DRAFT_KEY + id, value);
    } catch {
      /* ignore */
    }
  };

  const clearDraft = () => {
    try {
      window.sessionStorage.removeItem(DRAFT_KEY + walk.id);
    } catch {
      /* ignore */
    }
  };

  const save = () => {
    updateWalk(walk.id, { note: note.trim() || undefined });
    clearDraft();
    router.push(`/choice?id=${encodeURIComponent(walk.id)}`);
  };

  const skip = () => {
    clearDraft();
    router.push(`/choice?id=${encodeURIComponent(walk.id)}`);
  };

  return (
    <>
      <ScreenHeader
        backHref={`/choice?id=${encodeURIComponent(walk.id)}`}
        trailing={<span className="w-11" />}
      />
      <Screen>
        <h1 className="text-[1.9rem] font-bold tracking-tight">What changed?</h1>
        <p className="mt-3 text-[15px] text-[var(--color-text-secondary)]">
          A thought, feeling, decision, or observation…
        </p>
        <label className="mt-5 block">
          <span className="sr-only">Reflection note</span>
          <textarea
            value={note}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Type anything you want to remember…"
            rows={8}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[15px] leading-relaxed resize-y min-h-40"
          />
        </label>
        <div className="mt-6 flex flex-col gap-2">
          <PrimaryButton onClick={save}>Save</PrimaryButton>
          <div className="flex justify-center">
            <TextLink onClick={skip}>Skip</TextLink>
          </div>
        </div>
      </Screen>
    </>
  );
}
