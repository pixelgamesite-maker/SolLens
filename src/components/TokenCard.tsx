import { useState } from "react";
import { useStockPrice } from "@/hooks/useStockPrice";
import type { Token } from "@/types";

const RIGHTS_FIELDS: { term: string; key: keyof Token }[] = [
  { term: "Legal wrapper", key: "legalWrapper" },
  { term: "Custody", key: "custodyModel" },
  { term: "Dividends", key: "dividendHandling" },
  { term: "Voting", key: "votingRights" },
  { term: "Redemption", key: "redemption" },
  { term: "Corporate actions", key: "corporateActionPolicy" },
];

export function TokenCard({
  token,
  tokenPrice,
  tokenLoading,
  tokenError,
  referenceLabel,
}: {
  token: Token;
  tokenPrice: number | null;
  tokenLoading: boolean;
  tokenError: string | null;
  referenceLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const {
    price: underlyingPrice,
    loading: stockLoading,
    error: stockError,
  } = useStockPrice(token.underlyingTicker);

  const hasBoth = tokenPrice != null && underlyingPrice != null;
  const basis = hasBoth
    ? ((tokenPrice - underlyingPrice) / underlyingPrice) * 100
    : null;

  const unverified = token.mintAddress.startsWith("TODO");

  return (
    <article className="border-b border-hairline-soft py-7 first:pt-0 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[19px] font-semibold tracking-[-0.02em]">
            {token.symbol}
            <span className="ml-2.5 text-[14px] font-normal text-muted">
              {token.name}
            </span>
          </h3>
          <p className="mt-1 text-[13px] text-faint">
            Issued by {token.issuer}
            {unverified && " · registry entry unverified"}
          </p>
        </div>
        <BasisBadge basis={basis} />
      </div>

      <BasisMeter basis={basis} />

      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
        <Readout
          label="Token"
          value={
            tokenLoading
              ? "····"
              : tokenPrice != null
              ? `$${tokenPrice.toFixed(2)}`
              : "—"
          }
        />
        <Readout
          label={`${token.underlyingTicker} ${referenceLabel}`}
          value={
            stockLoading
              ? "····"
              : underlyingPrice != null
              ? `$${underlyingPrice.toFixed(2)}`
              : "—"
          }
        />
        <Readout
          label="Spread per share"
          value={
            hasBoth ? `$${(tokenPrice - underlyingPrice).toFixed(2)}` : "—"
          }
        />
      </div>

      {(tokenError || stockError) && (
        <p className="mt-4 border-l-2 border-alert pl-3 text-[13px] leading-relaxed text-alert">
          {tokenError && <>Token price unavailable. {tokenError}</>}
          {tokenError && stockError && <br />}
          {stockError && <>Reference price unavailable. {stockError}</>}
        </p>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="mt-5 flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-bright"
      >
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        What you actually own
      </button>

      {expanded && (
        <dl className="mt-4 border-l border-hairline pl-4">
          {RIGHTS_FIELDS.map(({ term, key }) => (
            <div key={term} className="py-2.5">
              <dt className="text-[12px] text-faint">{term}</dt>
              <dd className="mt-0.5 text-[14px] leading-relaxed text-bright/90">
                {String(token[key])}
              </dd>
            </div>
          ))}
          <div className="py-2.5">
            <dt className="text-[12px] text-faint">Not available in</dt>
            <dd className="mt-0.5 text-[14px] leading-relaxed text-bright/90">
              {token.excludedJurisdictions.join(", ")}
            </dd>
          </div>
        </dl>
      )}
    </article>
  );
}

function BasisBadge({ basis }: { basis: number | null }) {
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
function BasisMeter({ basis }: { basis: number | null }) {
  const RANGE = 3;
  const clamped = basis == null ? 0 : Math.max(-RANGE, Math.min(RANGE, basis));
  const pct = ((clamped + RANGE) / (RANGE * 2)) * 100;
  const premium = (basis ?? 0) >= 0;

  return (
    <div className="mt-5">
      <div className="relative h-6">
        {/* calibration ticks at each whole percent */}
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
        {/* baseline */}
        <div className="absolute inset-x-0 top-3 h-px bg-hairline-soft" />
        {/* needle */}
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
        <span>{basis == null ? "awaiting both prices" : premium ? "trading above the stock" : "trading below the stock"}</span>
        <span className="tnum">+3%</span>
      </div>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] leading-tight text-faint">{label}</div>
      <div className="tnum mt-1 text-[18px] text-bright">{value}</div>
    </div>
  );
}
