import { useEffect, useState } from "react";

// Finnhub's free tier supports CORS for browser calls.
// Sign up for a free key at finnhub.io and set it as VITE_FINNHUB_KEY in .env.
const FINNHUB_BASE = "https://finnhub.io/api/v1/quote";

export function useStockPrice(ticker: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Empty ticker means the caller already has a reference price
    // from Jupiter and does not need this fallback.
    if (!ticker) {
      setLoading(false);
      setError(null);
      return;
    }

    const key = import.meta.env.VITE_FINNHUB_KEY;
    if (!key) {
      setLoading(false);
      setError("Set VITE_FINNHUB_KEY in .env to enable live underlying prices.");
      return;
    }

    let cancelled = false;
    async function fetchQuote() {
      try {
        const url = `${FINNHUB_BASE}?symbol=${ticker}&token=${key}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Finnhub returned ${res.status}`);
        const json = await res.json();
        // json.c = current price. During market close this is the last close.
        if (!cancelled) {
          setPrice(json.c);
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

    fetchQuote();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { price, loading, error };
}
