"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PrimaryButton } from "./Buttons";

export function EmptyState({
  heading,
  body,
  actionLabel,
  actionHref,
  onAction,
}: {
  heading: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-start text-left py-8">
      <h2 className="text-[1.75rem] font-bold tracking-tight leading-tight">
        {heading}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-secondary)] max-w-prose">
        {body}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6 w-full">
          <PrimaryButton>{actionLabel}</PrimaryButton>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <div className="mt-6 w-full">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}

export function SafetyNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-center text-[13px] leading-relaxed text-[var(--color-text-muted)] ${className}`}
    >
      Only walk when it is safe and appropriate for you.
    </p>
  );
}

export function Screen({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`flex flex-1 flex-col px-5 pb-[max(1.5rem,var(--safe-bottom))] ${className}`}
    >
      {children}
    </main>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}
