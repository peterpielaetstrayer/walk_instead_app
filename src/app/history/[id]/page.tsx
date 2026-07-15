"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { HydrationGate } from "@/components/HydrationGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { TriggerSelector } from "@/components/Selectors";
import { ConfirmationDialog } from "@/components/Dialog";
import { Card, Screen } from "@/components/ui";
import {
  STATE_AFTER_LABELS,
  TRIGGER_LABELS,
  USEFUL_PAUSE_LABELS,
} from "@/lib/types";
import { formatDurationHuman, formatWalkDateTime } from "@/lib/format";
import { useWalkStore } from "@/lib/walk-store";

export default function WalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <HydrationGate>
      <WalkDetailContent id={id} />
    </HydrationGate>
  );
}

function WalkDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { getWalk, updateWalk, deleteWalk, setWalkTrigger } = useWalkStore();
  const walk = getWalk(id);
  const [editingTrigger, setEditingTrigger] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [customTrigger, setCustomTrigger] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!walk) {
    return (
      <Screen className="justify-center">
        <p className="text-[var(--color-text-secondary)]">
          This walk could not be found.
        </p>
        <PrimaryButton className="mt-6" onClick={() => router.push("/history")}>
          Back to history
        </PrimaryButton>
      </Screen>
    );
  }

  const triggerLabel =
    walk.trigger === "other" && walk.customTrigger
      ? walk.customTrigger
      : walk.trigger
        ? TRIGGER_LABELS[walk.trigger]
        : "Not set";

  return (
    <>
      <ScreenHeader title="Walk detail" backHref="/history" />
      <Screen>
        <Card>
          <dl className="space-y-3 text-[15px]">
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">When</dt>
              <dd className="font-medium">{formatWalkDateTime(walk.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">
                Duration
              </dt>
              <dd className="font-medium">
                {walk.actualDurationSeconds != null
                  ? formatDurationHuman(walk.actualDurationSeconds)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">Status</dt>
              <dd className="font-medium capitalize">{walk.status}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">
                Practice
              </dt>
              <dd className="font-medium">{walk.isPractice ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">
                Trigger
              </dt>
              <dd className="font-medium">{triggerLabel}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">
                How you felt
              </dt>
              <dd className="font-medium">
                {walk.stateAfter
                  ? STATE_AFTER_LABELS[walk.stateAfter]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">
                Useful pause
              </dt>
              <dd className="font-medium">
                {walk.usefulPause
                  ? USEFUL_PAUSE_LABELS[walk.usefulPause]
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)] text-sm">Note</dt>
              <dd className="font-medium whitespace-pre-wrap">
                {walk.note || "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="mt-6 flex flex-col gap-2">
          <SecondaryButton
            onClick={() => {
              setCustomTrigger(walk.customTrigger ?? "");
              setEditingTrigger(true);
            }}
          >
            Edit trigger
          </SecondaryButton>
          <SecondaryButton
            onClick={() => {
              setNoteDraft(walk.note ?? "");
              setEditingNote(true);
            }}
          >
            Edit note
          </SecondaryButton>
          <SecondaryButton onClick={() => setConfirmDelete(true)}>
            Delete event
          </SecondaryButton>
        </div>
      </Screen>

      <ConfirmationDialog
        open={editingTrigger}
        title="Edit trigger"
        onClose={() => setEditingTrigger(false)}
        actions={
          <PrimaryButton onClick={() => setEditingTrigger(false)}>
            Done
          </PrimaryButton>
        }
      >
        <TriggerSelector
          value={walk.trigger}
          customText={customTrigger}
          onChange={(trigger) => {
            setWalkTrigger(
              walk.id,
              trigger,
              trigger === "other" ? customTrigger : undefined,
            );
          }}
          onCustomTextChange={(text) => {
            setCustomTrigger(text);
            setWalkTrigger(walk.id, "other", text);
          }}
        />
      </ConfirmationDialog>

      <ConfirmationDialog
        open={editingNote}
        title="Edit note"
        onClose={() => setEditingNote(false)}
        actions={
          <>
            <PrimaryButton
              onClick={() => {
                updateWalk(walk.id, {
                  note: noteDraft.trim() || undefined,
                });
                setEditingNote(false);
              }}
            >
              Save
            </PrimaryButton>
            <SecondaryButton onClick={() => setEditingNote(false)}>
              Cancel
            </SecondaryButton>
          </>
        }
      >
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={5}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-[15px]"
          aria-label="Note"
        />
      </ConfirmationDialog>

      <ConfirmationDialog
        open={confirmDelete}
        title="Delete this walk?"
        onClose={() => setConfirmDelete(false)}
        actions={
          <>
            <PrimaryButton
              onClick={() => {
                deleteWalk(walk.id);
                router.replace("/history");
              }}
            >
              Delete
            </PrimaryButton>
            <SecondaryButton onClick={() => setConfirmDelete(false)}>
              Keep it
            </SecondaryButton>
          </>
        }
      >
        This removes the event from your device. It cannot be undone.
      </ConfirmationDialog>
    </>
  );
}
