"use client";

import { useWalkStore } from "@/lib/walk-store";
import type { ReactNode } from "react";

export function HydrationGate({ children }: { children: ReactNode }) {
  const { hydrated } = useWalkStore();

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
