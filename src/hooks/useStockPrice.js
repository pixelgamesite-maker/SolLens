import { useEffect, useState } from "react";

// A free, browser-callable (CORS-friendly) equity quote source is the
// missing piece here — most good ones (IEX, Polygon, Alpha Vantage)
// require a key and/or block direct browser calls in some tiers.
// Finnhub's free tier supports CORS and is a reasonable starting point:
// https://finnhub.io/docs/api/quote
// Sign up for a free key and put it in a .env file as VITE_FINNHUB_KEY.
const FINNHUB_BASE = "https://finnhub.io/api/v1/quote";

export function useStockPrice(ticker) {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          setError(err.message);
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
