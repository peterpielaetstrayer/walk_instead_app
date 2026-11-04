"use client";

import {
  STATE_AFTER_LABELS,
  TRIGGER_LABELS,
  USEFUL_PAUSE_LABELS,
  type StateAfter,
  type UsefulPause,
  type WalkTrigger,
} from "@/lib/types";

export function OutcomeSelector({
  value,
  onChange,
}: {
  value?: StateAfter;
  onChange: (v: StateAfter) => void;
}) {
  const options: StateAfter[] = ["better", "same", "worse"];
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="How are you now?">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`min-h-14 w-full rounded-[var(--radius-md)] border px-4 py-3 text-left text-base font-semibold transition-colors ${
              selected ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] ring-1 ring-[var(--color-primary)]" : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            {selected ? "◉  " : "○  "}{STATE_AFTER_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}

export function UsefulPauseSelector({
  value,
  onChange,
}: {
  value?: UsefulPause;
  onChange: (v: UsefulPause) => void;
}) {
  const options: UsefulPause[] = ["yes", "somewhat", "no"];
  return (
    <div
      className="flex flex-col gap-2"
      role="radiogroup"
      aria-label="Did the walk create a useful pause?"
    >
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt)}
            className={`min-h-12 w-full rounded-[var(--radius-md)] border px-4 py-3 text-left text-[15px] font-medium transition-colors ${
              selected
                ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            {USEFUL_PAUSE_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}

export function TriggerSelector({
  value,
  customText,
  onChange,
  onCustomTextChange,
}: {
  value?: WalkTrigger;
  customText?: string;
  onChange: (v: WalkTrigger) => void;
  onCustomTextChange?: (text: string) => void;
}) {
  const options = Object.keys(TRIGGER_LABELS) as WalkTrigger[];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Trigger">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onChange(opt)}
              className={`min-h-11 rounded-[var(--radius-full)] border px-4 text-sm font-medium transition-colors ${
                selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
              }`}
            >
              {TRIGGER_LABELS[opt]}
            </button>
          );
        })}
      </div>
      {value === "other" && onCustomTextChange && (
        <label className="mt-2 block">
          <span className="sr-only">Custom trigger</span>
          <input
            type="text"
            value={customText ?? ""}
            onChange={(e) => onCustomTextChange(e.target.value)}
            placeholder="Name it in your own words"
            maxLength={80}
            className="mt-1 w-full min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 text-[15px]"
          />
        </label>
      )}
    </div>
  );
}
