import { useState } from "react";
import { useStockPrice } from "@/hooks/useStockPrice";
import { cn } from "@/lib/utils";
import type { Token } from "@/types";

export function TokenCard({
  token,
  tokenPrice,
  tokenLoading,
  tokenError,
}: {
  token: Token;
  tokenPrice: number | null;
  tokenLoading: boolean;
  tokenError: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const {
    price: underlyingPrice,
    loading: stockLoading,
    error: stockError,
  } = useStockPrice(token.underlyingTicker);

  const basisPct =
    tokenPrice != null && underlyingPrice != null
      ? (((tokenPrice - underlyingPrice) / underlyingPrice) * 100).toFixed(2)
      : null;

  return (
    <div className="rounded-lg border border-neutral-200 p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="mr-2 text-lg font-semibold">{token.symbol}</span>
          <span className="text-sm text-neutral-500">{token.name}</span>
        </div>
        <span className="text-xs text-neutral-400">{token.issuer}</span>
      </div>

      <div className="mt-3 flex gap-6">
        <PriceBlock
          label="Token price"
          value={
            tokenLoading
              ? "…"
              : tokenError
              ? "—"
              : tokenPrice != null
              ? `$${tokenPrice.toFixed(2)}`
              : "—"
          }
        />
        <PriceBlock
          label={`${token.underlyingTicker} reference`}
          value={
            stockLoading
              ? "…"
              : stockError
              ? "—"
              : underlyingPrice != null
              ? `$${underlyingPrice.toFixed(2)}`
              : "—"
          }
        />
        <PriceBlock
          label="Basis"
          value={basisPct ? `${Number(basisPct) > 0 ? "+" : ""}${basisPct}%` : "—"}
          className={
            basisPct
              ? Number(basisPct) >= 0
                ? "text-green-700"
                : "text-red-600"
              : undefined
          }
        />
      </div>

      {(tokenError || stockError) && (
        <p className="mt-2 text-xs text-amber-700">
          {tokenError && <>Token price: {tokenError}. </>}
          {stockError && <>Reference price: {stockError}.</>}
        </p>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-blue-600 hover:underline"
      >
        {expanded ? "Hide rights & redemption" : "Show rights & redemption"}
      </button>

      {expanded && (
        <dl className="mt-3 space-y-2 text-sm">
          <Row term="Legal wrapper" value={token.legalWrapper} />
          <Row term="Dividend handling" value={token.dividendHandling} />
          <Row term="Voting rights" value={token.votingRights} />
          <Row term="Redemption" value={token.redemption} />
          <Row
            term="Excluded jurisdictions"
            value={token.excludedJurisdictions.join(", ")}
          />
          <Row term="Corporate actions" value={token.corporateActionPolicy} />
        </dl>
      )}
    </div>
  );
}

function PriceBlock({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className={cn("text-base font-semibold", className)}>{value}</span>
    </div>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-neutral-700">{term}</dt>
      <dd className="text-neutral-600">{value}</dd>
    </div>
  );
}
