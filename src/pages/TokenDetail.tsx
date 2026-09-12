import { useState } from "react";
import { Link } from "wouter";
import registryData from "@/data/registry.json";
import { BasisBadge, BasisMeter } from "@/components/BasisMeter";
import { PriceChart, RANGES } from "@/components/PriceChart";
import { RightsPanel } from "@/components/RightsPanel";
import { useJupiterPrice } from "@/hooks/useJupiterPrice";
import { useMarketSession } from "@/hooks/useMarketSession";
import { useOhlcv } from "@/hooks/useOhlcv";
import { useTokenMarket } from "@/hooks/useTokenMarket";
import type { Token } from "@/types";

const tokens = registryData.tokens as unknown as Token[];

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const compact = (n: number) =>
  `$${n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}`;
const count = (n: number) => n.toLocaleString("en-US");

export function TokenDetail({ id }: { id: string }) {
  const token = tokens.find((t) => t.id === id);
  const session = useMarketSession();
  const { quotes, error } = useJupiterPrice(token ? [token.mintAddress] : []);
  const { market, error: marketError } = useTokenMarket(token?.mintAddress);

  const quote = token ? quotes[token.mintAddress] : undefined;
  const tokenPrice = quote?.usdPrice ?? null;
  const reference = quote?.stockData?.price ?? null;
  const [rangeIndex, setRangeIndex] = useState(1);
  const range = RANGES[rangeIndex];
  const {
    candles,
    loading: candlesLoading,
    error: candlesError,
  } = useOhlcv(market?.primaryPair?.pairAddress, range.timeframe, range.limit);

  if (!token) {
    return (
      <main className="mx-auto max-w-[1600px] px-6 sm:px-10 py-24">
        <h1 className="text-[26px] font-semibold">No token with that name.</h1>
        <Link href="/" className="mt-4 inline-block text-discount underline underline-offset-2">
          Back to the registry
        </Link>
      </main>
    );
  }

  const hasBoth = tokenPrice != null && reference != null;
  const basis = hasBoth ? ((tokenPrice - reference) / reference) * 100 : null;
  const flow =
    market && market.totalBuys24h + market.totalSells24h > 0
      ? (market.totalBuys24h / (market.totalBuys24h + market.totalSells24h)) * 100
      : null;

  const refUpdated = quote?.stockData?.updatedAt
    ? new Date(quote.stockData.updatedAt)
    : null;
  const refAgeMin = refUpdated
    ? Math.round((Date.now() - refUpdated.getTime()) / 60000)
    : null;

  return (
    <main className="mx-auto max-w-[1600px] px-6 sm:px-10 pb-24 pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-bright"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3 rotate-180" aria-hidden="true">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        Registry
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 border-b border-hairline-soft pb-7">
        <div>
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-none tracking-[-0.03em]">
            {token.symbol}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {token.name} · tracks {token.underlyingTicker} · issued by {token.issuer}
          </p>
        </div>
        <div className="text-right">
          <div className="tnum text-[34px] leading-none">
            {tokenPrice != null ? usd(tokenPrice) : "—"}
          </div>
          <div className="mt-2">
            <BasisBadge basis={basis} />
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: the reading and its history */}
        <div>
          <div className="max-w-[620px]">
            <BasisMeter basis={basis} />
          </div>

          <section className="mt-9">
            <PriceChart
              candles={candles}
              loading={candlesLoading}
              error={candlesError}
              rangeIndex={rangeIndex}
              onRangeChange={setRangeIndex}
              referencePrice={reference}
            />
          </section>

          <section className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-hairline-soft py-7 sm:grid-cols-4">
            <Stat
              label={`${token.underlyingTicker} ${session.referenceLabel}`}
              value={reference != null ? usd(reference) : "—"}
              note={
                refAgeMin != null
                  ? refAgeMin < 60
                    ? `updated ${refAgeMin} min ago`
                    : `updated ${Math.round(refAgeMin / 60)} h ago`
                  : undefined
              }
            />
            <Stat
              label="Spread per share"
              value={hasBoth ? usd(tokenPrice - reference) : "—"}
            />
            <Stat
              label="24h volume"
              value={market ? compact(market.totalVolume24h) : "—"}
            />
            <Stat
              label="Pool liquidity"
              value={market ? compact(market.totalLiquidity) : "—"}
            />
          </section>

          <section className="mt-10">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              What you actually own
            </h2>
            <dl className="mt-5 max-w-[820px]">
              <RightsPanel token={token} />
            </dl>
          </section>
        </div>

        <aside className="xl:border-l xl:border-hairline-soft xl:pl-9">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">
            Trading over 24 hours
          </h2>

          {flow != null && market ? (
            <>
              <div className="mt-5 flex h-2 overflow-hidden">
                <span
                  className="block"
                  style={{ width: `${flow}%`, background: "var(--color-discount)" }}
                />
                <span
                  className="block flex-1"
                  style={{ background: "var(--color-premium)" }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[13px]">
                <span style={{ color: "var(--color-discount)" }}>
                  {count(market.totalBuys24h)} buys
                </span>
                <span style={{ color: "var(--color-premium)" }}>
                  {count(market.totalSells24h)} sells
                </span>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-faint">
                Trade counts, not size. A handful of large sells can outweigh many
                small buys.
              </p>
            </>
          ) : (
            <p className="mt-5 text-[14px] leading-relaxed text-muted">
              {marketError
                ? `Market data unavailable. ${marketError}`
                : "Loading market data."}
            </p>
          )}

          {market && market.pairs.length > 0 && (
            <div className="mt-8">
              <h3 className="text-[14px] text-bright">Where it trades</h3>
              <ul className="mt-3">
                {market.pairs.slice(0, 5).map((p) => (
                  <li
                    key={p.pairAddress}
                    className="flex items-baseline justify-between border-b border-hairline-soft py-2.5 text-[13px]"
                  >
                    <span className="text-muted">
                      {p.dexId}
                      {p.quoteSymbol && (
                        <span className="text-faint"> · {p.quoteSymbol}</span>
                      )}
                    </span>
                    <span className="tnum text-faint">
                      {p.liquidityUsd != null ? compact(p.liquidityUsd) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {error && (
        <p className="mt-8 border-l-2 border-alert pl-3 text-[13px] text-alert">
          Prices unavailable. {error}
        </p>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div>
      <div className="text-[12px] leading-tight text-faint">{label}</div>
      <div className="tnum mt-1 text-[20px] text-bright">{value}</div>
      {note && <div className="mt-0.5 text-[11px] text-faint">{note}</div>}
    </div>
  );
}
