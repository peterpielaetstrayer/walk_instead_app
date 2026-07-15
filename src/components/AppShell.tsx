"use client";

import type { ReactNode } from "react";

export function AppShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-dvh w-full flex justify-center bg-[var(--color-page-outside)]">
      <div
        className={`relative flex w-full max-w-[var(--max-app-width)] min-h-dvh flex-col bg-[var(--color-bg)] shadow-[var(--shadow-soft)] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
