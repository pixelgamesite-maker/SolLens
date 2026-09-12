import { useEffect, useState } from "react";

// NOTE: Jupiter's price API has changed tiers/endpoints before.
// Verify the current base URL and whether an API key is required
// at https://station.jup.ag/docs before your demo.
const JUPITER_PRICE_BASE = "https://lite-api.jup.ag/price/v2";

interface JupiterPriceData {
  [mint: string]: { price: string } | undefined;
}

export function useJupiterPrice(mintAddresses: string[], pollMs = 15000) {
  const [prices, setPrices] = useState<JupiterPriceData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const validIds = mintAddresses.filter(
      (id) => id && !id.startsWith("TODO")
    );

    if (validIds.length === 0) {
      setLoading(false);
      setError("No verified mint addresses provided yet.");
      return;
    }

    async function fetchPrices() {
      try {
        const url = `${JUPITER_PRICE_BASE}?ids=${validIds.join(",")}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Jupiter API returned ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setPrices(json.data || {});
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

  return { prices, loading, error };
}
