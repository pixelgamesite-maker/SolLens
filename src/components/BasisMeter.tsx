export function BasisBadge({ basis }: { basis: number | null }) {
  if (basis == null) {
    return <span className="tnum text-[13px] text-faint">no reading</span>;
  }
  const premium = basis >= 0;
  return (
    <span
      className="tnum text-[15px]"
      style={{ color: premium ? "var(--color-premium)" : "var(--color-discount)" }}
    >
      {premium ? "+" : ""}
      {basis.toFixed(2)}%
    </span>
  );
}

/**
 * Calibrated scale from -3% to +3%. The needle is the one loud element
 * on the page — everything else stays quiet so this reads first.
 */
export function BasisMeter({ basis }: { basis: number | null }) {
  const RANGE = 3;
  const clamped = basis == null ? 0 : Math.max(-RANGE, Math.min(RANGE, basis));
  const pct = ((clamped + RANGE) / (RANGE * 2)) * 100;
  const premium = (basis ?? 0) >= 0;
  const pegged = basis != null && Math.abs(basis) > RANGE;

  return (
    <div className="mt-5">
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-3 flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className={`block w-px ${
                i === 3 ? "h-3 bg-hairline" : "h-1.5 bg-hairline-soft"
              }`}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 top-3 h-px bg-hairline-soft" />
        {basis != null && (
          <div
            className="absolute top-0 h-6 w-[2px] -translate-x-1/2 transition-[left] duration-500 ease-out"
            style={{
              left: `${pct}%`,
              background: premium
                ? "var(--color-premium)"
                : "var(--color-discount)",
            }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-faint">
        <span className="tnum">−3%</span>
        <span>
          {basis == null
            ? "awaiting both prices"
            : pegged
            ? "beyond the scale"
            : premium
            ? "trading above the stock"
            : "trading below the stock"}
        </span>
        <span className="tnum">+3%</span>
      </div>
    </div>
  );
}
