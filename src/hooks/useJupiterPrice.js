import { useEffect, useState } from "react";

// NOTE: Jupiter's price API has changed tiers/endpoints before.
// Verify the current base URL and whether an API key is required
// at https://station.jup.ag/docs before your demo.
// As of early 2026 the free/lite tier lived at lite-api.jup.ag.
const JUPITER_PRICE_BASE = "https://lite-api.jup.ag/price/v2";

/**
 * Fetches live prices for a list of Solana mint addresses.
 * @param {string[]} mintAddresses
 * @param {number} pollMs - how often to refresh, 0 disables polling
 */
export function useJupiterPrice(mintAddresses = [], pollMs = 15000) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setError(err.message);
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
  }, [mintAddresses.join(","), pollMs]);

  return { prices, loading, error };
}
