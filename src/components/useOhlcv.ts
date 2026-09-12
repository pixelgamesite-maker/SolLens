import { useEffect, useState } from "react";

// GeckoTerminal public API — no key, CORS-enabled, keyed by POOL address
// (not by token mint). Get the pool from useTokenMarket().primaryPair.
//
// VERIFY IN A BROWSER TAB before relying on it:
//   https://api.geckoterminal.com/api/v2/networks/solana/pools/<POOL>/ohlcv/hour?limit=168
const GT_BASE = "https://api.geckoterminal.com/api/v2/networks/solana/pools";

export type Timeframe = "minute" | "hour" | "day";

export interface Candle {
  t: number; // ms epoch
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export function useOhlcv(
  poolAddress: string | undefined,
  timeframe: Timeframe = "hour",
  limit = 168
) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poolAddress) return;
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(
          `${GT_BASE}/${poolAddress}/ohlcv/${timeframe}?limit=${limit}`
        );
        if (!res.ok) throw new Error(`GeckoTerminal returned ${res.status}.`);
        const json = await res.json();

        // Response shape: data.attributes.ohlcv_list = [[ts, o, h, l, c, v], ...]
        // newest first, timestamps in SECONDS.
        const list: number[][] = json?.data?.attributes?.ohlcv_list ?? [];
        const parsed: Candle[] = list
          .map(([ts, o, h, l, c, v]) => ({
            t: ts * 1000,
            o,
            h,
            l,
            c,
            v,
          }))
          .sort((a, b) => a.t - b.t);

        if (!cancelled) {
          setCandles(parsed);
          setError(parsed.length === 0 ? "No candles returned for this pool." : null);
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
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [poolAddress, timeframe, limit]);

  return { candles, loading, error };
}
