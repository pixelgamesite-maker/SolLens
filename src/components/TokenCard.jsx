import { useState } from "react";
import { useJupiterPrice } from "../hooks/useJupiterPrice";
import { useStockPrice } from "../hooks/useStockPrice";
import "./TokenCard.css";

export function TokenCard({ token }) {
  const [expanded, setExpanded] = useState(false);

  const { prices, loading: tokenLoading, error: tokenError } =
    useJupiterPrice([token.mintAddress]);
  const { price: underlyingPrice, loading: stockLoading, error: stockError } =
    useStockPrice(token.underlyingTicker);

  const tokenPrice = prices[token.mintAddress]?.price;
  const basisPct =
    tokenPrice && underlyingPrice
      ? (((tokenPrice - underlyingPrice) / underlyingPrice) * 100).toFixed(2)
      : null;

  return (
    <div className="token-card">
      <div className="token-card-header">
        <div>
          <span className="token-symbol">{token.symbol}</span>
          <span className="token-name">{token.name}</span>
        </div>
        <span className="token-issuer">{token.issuer}</span>
      </div>

      <div className="token-prices">
        <div className="price-block">
          <span className="price-label">Token price</span>
          <span className="price-value">
            {tokenLoading
              ? "…"
              : tokenError
              ? "—"
              : tokenPrice
              ? `$${Number(tokenPrice).toFixed(2)}`
              : "—"}
          </span>
        </div>
        <div className="price-block">
          <span className="price-label">{token.underlyingTicker} reference</span>
          <span className="price-value">
            {stockLoading
              ? "…"
              : stockError
              ? "—"
              : underlyingPrice
              ? `$${Number(underlyingPrice).toFixed(2)}`
              : "—"}
          </span>
        </div>
        <div className="price-block">
          <span className="price-label">Basis</span>
          <span
            className={`price-value ${
              basisPct
                ? Number(basisPct) >= 0
                  ? "basis-positive"
                  : "basis-negative"
                : ""
            }`}
          >
            {basisPct ? `${basisPct > 0 ? "+" : ""}${basisPct}%` : "—"}
          </span>
        </div>
      </div>

      {(tokenError || stockError) && (
        <p className="token-card-note">
          {tokenError && <>Token price: {tokenError}. </>}
          {stockError && <>Reference price: {stockError}.</>}
        </p>
      )}

      <button className="rights-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide rights & redemption" : "Show rights & redemption"}
      </button>

      {expanded && (
        <dl className="rights-list">
          <dt>Legal wrapper</dt>
          <dd>{token.legalWrapper}</dd>
          <dt>Dividend handling</dt>
          <dd>{token.dividendHandling}</dd>
          <dt>Voting rights</dt>
          <dd>{token.votingRights}</dd>
          <dt>Redemption</dt>
          <dd>{token.redemption}</dd>
          <dt>Excluded jurisdictions</dt>
          <dd>{token.excludedJurisdictions?.join(", ")}</dd>
          <dt>Corporate actions</dt>
          <dd>{token.corporateActionPolicy}</dd>
        </dl>
      )}
    </div>
  );
}
