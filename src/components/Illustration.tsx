/** Minimal outdoor path illustration — CSS/SVG, no stock photo */
export function PathIllustration({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[linear-gradient(180deg,#e8efe8_0%,#f7f6f2_55%,#ebe6dc_100%)] ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 320 160"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 110 C60 95, 90 125, 140 115 S220 90, 320 105 L320 160 L0 160 Z"
          fill="#d5ddd4"
        />
        <path
          d="M120 160 C145 120, 155 95, 160 70 C165 95, 175 120, 200 160"
          fill="#c4b59a"
          opacity="0.9"
        />
        <path
          d="M155 70 C158 55, 162 55, 165 70"
          fill="none"
          stroke="#8a9a88"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="48" cy="48" r="14" fill="#f2efe6" opacity="0.9" />
        <path
          d="M40 125 H280"
          stroke="#315BFF"
          strokeWidth="2"
          strokeDasharray="6 8"
          opacity="0.55"
        />
        <circle cx="72" cy="125" r="4" fill="#315BFF" />
        <circle cx="160" cy="125" r="4" fill="#315BFF" opacity="0.7" />
        <circle cx="248" cy="125" r="4" fill="#315BFF" opacity="0.45" />
      </svg>
    </div>
  );
}

export function AppIconMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="128" height="128" rx="28" fill="#315BFF" />
      <path
        d="M34 78c18-28 28-40 42-44 10-3 18 2 22 10"
        fill="none"
        stroke="#fff"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M86 52l14 2-6 12"
        fill="none"
        stroke="#fff"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="86" r="5" fill="#fff" />
      <circle cx="64" cy="74" r="5" fill="#fff" />
    </svg>
  );
}
