import { useEffect, useState } from "react";

// Jupiter Price API v3. Returns a flat object keyed by mint address —
// no { data: ... } wrapper, and the field is usdPrice (not price).
const JUPITER_PRICE_BASE = "https://lite-api.jup.ag/price/v3";

export interface JupiterStockData {
  /** Reference price of the underlying share, per Jupiter */
  price: number;
  mcap: number;
  /** ISO timestamp — outside trading hours this stops advancing */
  updatedAt: string;
}

export interface JupiterQuote {
  usdPrice: number;
  liquidity?: number;
  priceChange24h?: number;
  decimals?: number;
  /** Present for tokenized equities; absent for ordinary tokens */
  stockData?: JupiterStockData;
}

export type JupiterQuotes = Record<string, JupiterQuote | undefined>;

export function useJupiterPrice(mintAddresses: string[], pollMs = 15000) {
  const [quotes, setQuotes] = useState<JupiterQuotes>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const validIds = mintAddresses.filter((id) => id && !id.startsWith("TODO"));

    if (validIds.length === 0) {
      setLoading(false);
      setError("No verified mint addresses in the registry yet.");
      return;
    }

    async function fetchPrices() {
      try {
        const res = await fetch(`${JUPITER_PRICE_BASE}?ids=${validIds.join(",")}`);
        if (!res.ok) throw new Error(`Jupiter returned ${res.status}.`);
        const json = (await res.json()) as JupiterQuotes;
        if (!cancelled) {
          setQuotes(json ?? {});
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

    fetchPrices();
    if (pollMs > 0) {
      const interval = setInterval(fetchPrices, pollMs);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintAddresses.join(","), pollMs]);

  return { quotes, loading, error };
}
