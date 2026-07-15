"use client";

import { WalkStoreProvider } from "@/lib/walk-store";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <WalkStoreProvider>{children}</WalkStoreProvider>;
}
