import { useState } from "react";
import type { Candle, Timeframe } from "@/hooks/useOhlcv";

const RANGES: { label: string; timeframe: Timeframe; limit: number }[] = [
  { label: "24h", timeframe: "minute", limit: 288 },
  { label: "7d", timeframe: "hour", limit: 168 },
  { label: "30d", timeframe: "hour", limit: 720 },
  { label: "All", timeframe: "day", limit: 365 },
];

export { RANGES };

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function PriceChart({
  candles,
  loading,
  error,
  rangeIndex,
  onRangeChange,
  referencePrice,
}: {
  candles: Candle[];
  loading: boolean;
  error: string | null;
  rangeIndex: number;
  onRangeChange: (i: number) => void;
  referencePrice: number | null;
}) {
  const [hover, setHover] = useState<Candle | null>(null);

  const W = 760;
  const H = 220;
  const PAD_Y = 14;

  const body = () => {
    if (loading && candles.length === 0) {
      return (
        <div className="flex h-[220px] items-center justify-center text-[13px] text-faint">
          Loading candles.
        </div>
      );
    }
    if (error && candles.length === 0) {
      return (
        <div className="flex h-[220px] items-center justify-center px-6 text-center text-[13px] text-alert">
          {error}
        </div>
      );
    }
    if (candles.length < 2) {
      return (
        <div className="flex h-[220px] items-center justify-center text-[13px] text-faint">
          Not enough history for this range.
        </div>
      );
    }

    const lows = candles.map((c) => c.l);
    const highs = candles.map((c) => c.h);
    let min = Math.min(...lows);
    let max = Math.max(...highs);
    if (referencePrice != null) {
      min = Math.min(min, referencePrice);
      max = Math.max(max, referencePrice);
    }
    const span = max - min || 1;

    const x = (i: number) => (i / (candles.length - 1)) * W;
    const y = (v: number) => PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2);

    const line = candles
      .map((c, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(c.c)}`)
      .join(" ");
    const area = `${line} L${W},${H} L0,${H} Z`;

    const first = candles[0].c;
    const last = candles[candles.length - 1].c;
    const up = last >= first;
    const stroke = up ? "var(--color-discount)" : "var(--color-premium)";

    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[220px] w-full touch-none"
        preserveAspectRatio="none"
        role="img"
        aria-label="Token price history"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const i = Math.round(ratio * (candles.length - 1));
          setHover(candles[Math.max(0, Math.min(candles.length - 1, i))]);
        }}
      >
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#fade)" />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {referencePrice != null && (
          <line
            x1="0"
            x2={W}
            y1={y(referencePrice)}
            y2={y(referencePrice)}
            stroke="var(--color-faint)"
            strokeWidth="1"
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {hover && (
          <line
            x1={x(candles.indexOf(hover))}
            x2={x(candles.indexOf(hover))}
            y1="0"
            y2={H}
            stroke="var(--color-hairline)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    );
  };

  const shown = hover ?? candles[candles.length - 1];

  return (
    <figure>
      <div className="flex items-baseline justify-between gap-4">
        <div className="tnum text-[14px] text-muted">
          {shown ? (
            <>
              {usd(shown.c)}
              <span className="ml-3 text-faint">
                {new Date(shown.t).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </>
          ) : (
            "—"
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => onRangeChange(i)}
              className={`px-2.5 py-1 text-[13px] transition-colors ${
                i === rangeIndex
                  ? "bg-surface text-bright"
                  : "text-faint hover:text-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 border border-hairline-soft bg-abyss/40">{body()}</div>

      <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-faint">
        <span className="flex items-center gap-2">
          <span className="h-[2px] w-4 bg-discount" />
          Token, deepest pool
        </span>
        {referencePrice != null && (
          <span className="flex items-center gap-2">
            <span className="h-px w-4 border-t border-dashed border-faint" />
            {usd(referencePrice)} reference now
          </span>
        )}
      </figcaption>
    </figure>
  );
}
