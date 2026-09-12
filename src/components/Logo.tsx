export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
      {/* calibration ticks — the instrument reference */}
      <path d="M16 1.75V6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 26V30.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.75 16H6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M26 16H30.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Renders /sollens.png if you drop one into public/,
 * otherwise falls back to the vector mark above.
 */
export function Logo() {
  return (
    <a
      href="/"
      className="flex items-center gap-2.5 text-bright"
      aria-label="SolLens home"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <LogoMark className="h-7 w-7 text-discount" />
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.02em]">
        SolLens
      </span>
    </a>
  );
}
