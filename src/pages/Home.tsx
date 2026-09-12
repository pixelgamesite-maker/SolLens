import registryData from "@/data/registry.json";
import { TokenCard } from "@/components/TokenCard";
import { useJupiterPrice } from "@/hooks/useJupiterPrice";
import { useMarketSession } from "@/hooks/useMarketSession";
import type { Token } from "@/types";

const tokens = registryData.tokens as unknown as Token[];
const mintAddresses = tokens.map((t) => t.mintAddress);

export function Home() {
  const { quotes, loading, error } = useJupiterPrice(mintAddresses);
  const session = useMarketSession();

  return (
    <>
      {/* Hero: the session clock, because the gap between a 24/7 chain and a
          closed exchange is the whole reason basis drifts. */}
      <section className="mx-auto max-w-[1600px] px-6 sm:px-10 pb-14 pt-16 sm:pt-24">
        <div className="max-w-[34ch]">
          <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            A tokenized stock is not the stock.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-muted">
            SolLens puts the issuer, the rights, and the redemption terms next to
            the price, and shows how far each token has drifted from the share it
            tracks.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-12 gap-y-5 border-t border-hairline-soft pt-6">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: session.isOpen
                  ? "var(--color-discount)"
                  : "var(--color-faint)",
              }}
            />
            <span className="text-[15px]">
              {session.isOpen ? "Exchange open" : "Exchange closed"}
            </span>
            <span className="tnum text-[14px] text-faint">
              {session.nyTime} New York
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--color-discount)" }}
            />
            <span className="text-[15px]">Solana always open</span>
          </div>
          <p className="text-[13px] leading-relaxed text-faint">
            {session.isOpen
              ? "Both sides are live, so basis reflects real supply and demand."
              : "The reference price is frozen at the last close while tokens keep trading."}
          </p>
        </div>
      </section>

      <main id="registry" className="mx-auto max-w-[1600px] px-6 sm:px-10 pb-24">
        <div className="max-w-[1100px] rounded-lg border border-hairline-soft bg-ink px-6 py-7 sm:px-9 sm:py-9">
          {loading && (
            <p className="tnum py-10 text-center text-[14px] text-faint">
              Reading prices…
            </p>
          )}

          {!loading && error && (
            <div className="border-l-2 border-alert pl-4 py-1">
              <p className="text-[15px] text-bright">No prices to show yet.</p>
              <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">
                {error} Add verified mint addresses to{" "}
                <code className="tnum text-[13px] text-discount">
                  src/data/registry.json
                </code>{" "}
                and the readouts below will fill in.
              </p>
            </div>
          )}

          <div className={loading ? "hidden" : "mt-2"}>
            {tokens.map((token) => (
              <TokenCard
                key={token.id}
                token={token}
                quote={quotes[token.mintAddress]}
                loading={loading}
                error={error}
                referenceLabel={session.referenceLabel}
              />
            ))}
          </div>
        </div>

        <section id="basis" className="mt-20 max-w-[62ch]">
          <h2 className="text-[26px] font-semibold tracking-[-0.025em]">
            Why the two prices differ
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Basis is the gap between what a token trades for on Solana and what
            its underlying share last printed on the exchange. A positive number
            means you are paying more than the share is worth; a negative one
            means less. Overnight and at weekends the exchange price stops
            updating while the token keeps moving, so wide readings outside
            trading hours usually reflect a stale reference rather than a real
            dislocation.
          </p>
        </section>

        <section id="sources" className="mt-16 max-w-[62ch]">
          <h2 className="text-[26px] font-semibold tracking-[-0.025em]">
            Where the data comes from
          </h2>
          <dl className="mt-4 border-t border-hairline-soft">
            <SourceRow
              term="Token prices"
              detail="Jupiter, refreshed every 15 seconds."
            />
            <SourceRow
              term="Reference prices"
              detail="Finnhub. Outside trading hours this is the last close, not a live quote."
            />
            <SourceRow
              term="Rights and redemption"
              detail="Read by hand from each issuer's own terms, with a source link on every field."
            />
          </dl>
        </section>
      </main>

      <footer className="border-t border-hairline-soft">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-[13px] leading-relaxed text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>SolLens · built for Solana hackathon 2026</span>
          <span>Information only. Not investment advice.</span>
        </div>
      </footer>
    </>
  );
}

function SourceRow({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="grid gap-1 border-b border-hairline-soft py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
      <dt className="text-[14px] text-bright">{term}</dt>
      <dd className="text-[14px] leading-relaxed text-muted">{detail}</dd>
    </div>
  );
}
