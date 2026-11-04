"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center gap-2 min-h-11 px-5 py-3 text-base font-semibold rounded-[var(--radius-md)] transition-[transform,background-color,border-color,color,opacity] duration-150 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] motion-reduce:active:scale-100";

export function PrimaryButton({
  children,
  className = "",
  fullWidth = true,
  ...props
}: CommonProps) {
  return (
    <button
      type="button"
      className={`${base} bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  fullWidth = true,
  ...props
}: CommonProps) {
  return (
    <button
      type="button"
      className={`${base} bg-transparent text-[var(--color-text)] border border-[var(--color-control-border)] hover:bg-white ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextLink({
  children,
  className = "",
  ...props
}: CommonProps) {
  return (
    <button
      type="button"
      className={`min-h-11 px-2 py-2 text-[15px] font-medium text-[var(--color-primary)] underline-offset-4 hover:underline disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
