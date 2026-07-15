"use client";

import Link from "next/link";
import { AppIconMark } from "@/components/Illustration";
import { PrimaryButton } from "@/components/Buttons";

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <AppIconMark size={64} />
      <h1 className="mt-6 text-2xl font-bold tracking-tight">You are offline</h1>
      <p className="mt-3 text-[15px] text-[var(--color-text-secondary)] max-w-sm">
        Walk Instead keeps your walks on this device. After you have visited the
        app online once, the main screens should be available offline.
      </p>
      <Link href="/" className="mt-8 w-full max-w-xs">
        <PrimaryButton>Try home</PrimaryButton>
      </Link>
    </main>
  );
}
