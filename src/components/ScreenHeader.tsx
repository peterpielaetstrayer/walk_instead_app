"use client";

import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Settings, X } from "lucide-react";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  backHref,
  onBack,
  onClose,
  onMenu,
  menuHref = "/settings",
  trailing,
}: {
  title?: string;
  backHref?: string;
  onBack?: () => void;
  onClose?: () => void;
  onMenu?: () => void;
  menuHref?: string;
  trailing?: ReactNode;
}) {
  const backControl = onBack ? (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text)] hover:bg-white"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
    </button>
  ) : backHref ? (
    <Link
      href={backHref}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text)] hover:bg-white"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
    </Link>
  ) : onClose ? (
    <button
      type="button"
      onClick={onClose}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text)] hover:bg-white"
      aria-label="Close"
    >
      <X className="h-5 w-5" aria-hidden />
    </button>
  ) : (
    <span className="w-11" aria-hidden />
  );

  return (
    <header className="flex items-center justify-between gap-2 px-3 pt-[max(0.75rem,var(--safe-top))] pb-2">
      {backControl}
      {title ? (
        <h1 className="flex-1 text-center text-[17px] font-semibold tracking-tight truncate">
          {title}
        </h1>
      ) : (
        <div className="flex-1" />
      )}
      {trailing ??
        (onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text)] hover:bg-white"
            aria-label="More options"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <Link
            href={menuHref}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text)] hover:bg-white"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" aria-hidden />
          </Link>
        ))}
    </header>
  );
}
