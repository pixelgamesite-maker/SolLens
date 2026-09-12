import { useEffect, useState } from "react";

// DexScreener public API — no key, CORS-enabled.
// VERIFY THIS URL IN A BROWSER TAB before relying on it, the same way
// the Jupiter endpoint needed checking:
//   https://api.dexscreener.com/latest/dex/tokens/<mint>
const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex/tokens";

export interface MarketPair {
  dexId: string;
  quoteSymbol?: string;
  pairAddress: string;
  url?: string;
  priceUsd?: string;
  liquidityUsd?: number;
  volume24h?: number;
  buys24h?: number;
  sells24h?: number;
  priceChange24h?: number;
}

export interface TokenMarket {
  pairs: MarketPair[];
  /** Deepest pool by liquidity — the one worth charting */
  primaryPair: MarketPair | null;
  totalVolume24h: number;
  totalLiquidity: number;
  totalBuys24h: number;
  totalSells24h: number;
}

export function useTokenMarket(mint: string | undefined, pollMs = 30000) {
  const [market, setMarket] = useState<TokenMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mint) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${DEXSCREENER_BASE}/${mint}`);
        if (!res.ok) throw new Error(`DexScreener returned ${res.status}.`);
        const json = await res.json();
        const all = Array.isArray(json?.pairs) ? json.pairs : [];

        // Only pairs where THIS token is the base asset. DexScreener also
        // returns pairs where the token is the quote side — memecoins that
        // priced themselves against TSLAx, for example. Including those
        // inflates volume, liquidity and trade counts with activity that
        // has nothing to do with the tokenized stock.
        const raw = all.filter(
          (p: any) =>
            p?.baseToken?.address?.toLowerCase() === mint!.toLowerCase()
        );

        const pairs: MarketPair[] = raw.map((p: any) => ({
          dexId: p.dexId,
          quoteSymbol: p.quoteToken?.symbol,
          pairAddress: p.pairAddress,
          url: p.url,
          priceUsd: p.priceUsd,
          liquidityUsd: p.liquidity?.usd,
          volume24h: p.volume?.h24,
          buys24h: p.txns?.h24?.buys,
          sells24h: p.txns?.h24?.sells,
          priceChange24h: p.priceChange?.h24,
        }));

        const sum = (f: (p: MarketPair) => number | undefined) =>
          pairs.reduce((acc, p) => acc + (f(p) ?? 0), 0);

        if (!cancelled) {
          const sorted = pairs.sort(
            (a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0)
          );
          setMarket({
            pairs: sorted,
            primaryPair: sorted[0] ?? null,
            totalVolume24h: sum((p) => p.volume24h),
            totalLiquidity: sum((p) => p.liquidityUsd),
            totalBuys24h: sum((p) => p.buys24h),
            totalSells24h: sum((p) => p.sells24h),
          });
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    load();
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [mint, pollMs]);

  return { market, loading, error };
}
