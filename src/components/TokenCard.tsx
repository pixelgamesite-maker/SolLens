import { Link } from "wouter";
import type { JupiterQuote } from "@/hooks/useJupiterPrice";
import { RIGHTS_TOTAL, verifiedCount, type Token } from "@/types";
import { BasisMeter, BasisBadge } from "./BasisMeter";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const compactUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}`;

export function TokenCard({
  token,
  quote,
  loading,
  error,
  referenceLabel,
}: {
  token: Token;
  quote: JupiterQuote | undefined;
  loading: boolean;
  error: string | null;
  referenceLabel: string;
}) {
  const tokenPrice = quote?.usdPrice ?? null;
  const reference = quote?.stockData?.price ?? null;
  const hasBoth = tokenPrice != null && reference != null;
  const basis = hasBoth ? ((tokenPrice - reference) / reference) * 100 : null;
  const known = verifiedCount(token.rights);

  return (
    <Link
      href={`/t/${token.id}`}
      className="group block border-b border-hairline-soft py-7 first:pt-0 last:border-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[19px] font-semibold tracking-[-0.02em] transition-colors group-hover:text-discount">
            {token.symbol}
            <span className="ml-2.5 text-[14px] font-normal text-muted">
              {token.name}
            </span>
          </h3>
          <p className="mt-1 text-[13px] text-faint">
            Issued by {token.issuer}
            {quote?.liquidity != null && (
              <> · {compactUsd(quote.liquidity)} pool liquidity</>
            )}
          </p>
        </div>
        <BasisBadge basis={basis} />
      </div>

      <BasisMeter basis={basis} />

      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        <Readout
          label="Token"
          value={loading ? "····" : tokenPrice != null ? usd(tokenPrice) : "—"}
        />
        <Readout
          label={`${token.underlyingTicker} ${referenceLabel}`}
          value={loading ? "····" : reference != null ? usd(reference) : "—"}
        />
        <Readout
          label="Spread per share"
          value={hasBoth ? usd(tokenPrice - reference) : "—"}
        />
        <Readout
          label="Rights on file"
          value={`${known} of ${RIGHTS_TOTAL}`}
        />
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-alert pl-3 text-[13px] leading-relaxed text-alert">
          Prices unavailable. {error}
        </p>
      )}

      <span className="mt-5 inline-flex items-center gap-2 text-[14px] text-muted transition-colors group-hover:text-bright">
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        Open {token.symbol}
      </span>
    </Link>
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
