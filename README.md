# SolLens

**A tokenized stock is not the stock. SolLens shows you the difference.**

SolLens puts the issuer, the legal rights, and the redemption terms of a tokenized
stock directly next to its live price — and measures how far that price has drifted
from the share it claims to track.

Built for the Solana tokenized-stocks hackathon, September 2026.

---

## The problem

Tokenized stocks on Solana crossed into real volume, but the buying experience
still looks like any other token swap: a ticker, a price, a swap button. What that
interface never tells you:

- **Who issued this, and what is the legal wrapper?** A 1:1 custodied share and a
  tracker certificate are very different instruments with the same-looking ticker.
- **Do you get the dividend?** Some issuers pass it through in cash, some adjust
  your token quantity, some do neither.
- **Can you redeem?** Most retail holders cannot. They can only sell into a pool.
  That is the single most misunderstood fact about these instruments.
- **Are you overpaying right now?** The token trades 24/7. The exchange does not.
  On a Sunday afternoon the "price" you see has no live reference behind it.

Each of these is knowable. None of them is shown at the point of trade.

## What SolLens does

Three things, in one view per token:

1. **Basis measurement.** Compares the token's live price on Solana against the
   underlying share's price, and renders the gap on a calibrated −3% to +3% meter.
   Warm needle = trading above the stock. Cool needle = trading below.

2. **Session awareness.** A live New York clock shows whether the exchange is open.
   When it is closed, the reference price is explicitly labelled *last close*, not
   *live quote* — so a wide basis reading outside trading hours is understood as a
   stale reference rather than a real dislocation.

3. **Rights disclosure.** An expandable panel per token showing legal wrapper,
   custody model, dividend handling, voting rights, redemption eligibility,
   corporate-action policy, and excluded jurisdictions — each field sourced from
   the issuer's own documents.

## What SolLens is not

- Not a trading venue. It never executes, routes, or signs a transaction.
- Not investment advice.
- Not an oracle. It reads public APIs and renders them.

---

## How it works

```
┌─────────────────┐
│ registry.json   │  hand-verified rights data, one entry per token
└────────┬────────┘
         │
┌────────▼────────┐     ┌──────────────────┐    ┌──────────────────┐
│    App.tsx      │────▶│ useJupiterPrice  │───▶│ Jupiter price API│
│ (single page)   │     │  (batched, 15s)  │    └──────────────────┘
│                 │     └──────────────────┘
│                 │     ┌──────────────────┐    ┌──────────────────┐
│                 │────▶│ useMarketSession │    │ Finnhub quote API│
│                 │     │  (NY clock, 1s)  │    └────────▲─────────┘
│                 │     └──────────────────┘             │
└────────┬────────┘                                      │
         │                 ┌──────────────────┐          │
         └────────────────▶│   TokenCard      │──────────┘
           one per token   │  useStockPrice   │
                           └──────────────────┘
```

**Price fetching is batched at the top.** `App.tsx` requests all mint addresses
from Jupiter in a single call every 15 seconds and passes results down as props.
Each card does *not* poll independently — that would multiply requests by the
number of tokens and hit rate limits during a demo.

**Reference prices are per-card.** Each `TokenCard` fetches its own underlying
equity quote, since Finnhub's quote endpoint takes one symbol at a time.

**Basis is computed client-side:**

```
basis % = ((tokenPrice − underlyingPrice) / underlyingPrice) × 100
```

Positive means the token trades above the share. The meter clamps the needle at
±3% so ordinary readings stay legible; larger real dislocations still show their
exact figure in the badge.

---

## Project structure

```
sollens/
├── public/
│   └── sollens.png              logo / favicon
├── index.html                   fonts, theme colour, meta
├── Dockerfile                   node build → caddy serve on :8080
├── Caddyfile                    static file server, SPA fallback
├── vite.config.js               port 8080, @ alias → src
└── src/
    ├── main.tsx                 React root
    ├── App.tsx                  page composition, batched price fetch
    ├── index.css                theme tokens (Tailwind v4 @theme)
    ├── types.ts                 Token interface
    ├── vite-env.d.ts            typing for VITE_FINNHUB_KEY
    ├── data/
    │   └── registry.json        ← the actual product. See below.
    ├── hooks/
    │   ├── useJupiterPrice.ts   batched token prices, 15s poll
    │   ├── useStockPrice.ts     single underlying equity quote
    │   └── useMarketSession.ts  NYSE open/closed in America/New_York
    ├── components/
    │   ├── Header.tsx           logo + hamburger + slide-in panel
    │   ├── Logo.tsx             aperture mark, PNG-swappable
    │   └── TokenCard.tsx        readouts, basis meter, rights panel
    └── lib/
        └── utils.ts             cn() helper (unused; kept for shadcn)
```

### The registry is the project

`src/data/registry.json` is the part that cannot be cloned in an afternoon. Price
APIs are commodity; hand-verified rights data is not. Every field is read from the
issuer's own terms documents, not from secondary coverage.

Schema, one entry per token:

| Field | What it records |
|---|---|
| `symbol` / `name` / `issuer` | Identity |
| `underlyingTicker` | Symbol used for the reference quote |
| `mintAddress` | Solana mint, used for the Jupiter lookup |
| `legalWrapper` | Tracker certificate vs 1:1 custodied share |
| `custodyModel` | Who holds the underlying, and where |
| `dividendHandling` | Cash pass-through, quantity adjustment, or none |
| `votingRights` | Almost always none — stated explicitly rather than omitted |
| `redemption` | Who may redeem, and under what KYC tier |
| `excludedJurisdictions` | Where the token may not be held |
| `corporateActionPolicy` | Splits, delistings, index rebalances |
| `sourceUrl` | Link to the document each field came from |

Fields still marked `TODO_VERIFY` have not been confirmed against source documents
and must not be treated as accurate. They render as-is deliberately — an unverified
field showing its own uncertainty is more honest than a blank.

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:8080
```

### Environment

Create `.env` at the project root:

```
VITE_FINNHUB_KEY=your_key_here
```

Get a free key at [finnhub.io](https://finnhub.io). Their free tier supports
browser CORS and is rate-limited — fine for a demo, not for production traffic.

Without this key the app runs, and says so: reference prices show `—` with an
explanatory message rather than failing silently.

`.env` is gitignored. Never commit it.

### Other commands

```bash
npm run build        # production bundle → dist/
npm run serve        # preview the built bundle on :8080
npm run typecheck    # tsc --noEmit
```

---

## Deploying

Railway, via Docker:

1. Push to GitHub including `Dockerfile`, `.dockerignore` and `Caddyfile`.
2. Railway → New Project → Deploy from GitHub repo. The root `Dockerfile` is
   detected automatically.
3. **Add `VITE_FINNHUB_KEY` under Variables.** Vite inlines `VITE_*` variables at
   *build* time, so it must reach `docker build` — the Dockerfile declares a
   matching `ARG` for this. A runtime-only variable will silently produce a bundle
   with no key in it.
4. Networking → Generate Domain. Target port `8080` if not auto-detected.

The build is two-stage: Node compiles the bundle, Caddy serves the static output.
The runtime image contains no Node and no source.

---

## Known limitations

- **Market holidays are not handled.** `useMarketSession` knows weekends and
  trading hours, not the NYSE holiday calendar. On Thanksgiving it will say open.
- **Reference quotes are delayed** on Finnhub's free tier. Basis figures are
  directionally right, not execution-grade.
- **Basis uses last close outside trading hours**, which is correct behaviour but
  means overnight readings measure staleness as much as dislocation.
- **Registry coverage is five tokens**, all from one issuer, because one issuer
  currently dominates this category on Solana. Cross-issuer comparison is the
  natural next step once there is more than one issuer to compare.
- **No proof-of-reserve check yet.** Comparing onchain supply against attested
  shares in custody is the highest-value unbuilt feature.

## Roadmap

- **Exit-cost simulator** — "sell $50k of TSLAx" → routed price, slippage, and
  whether redemption is available to you at all.
- **Reserve verification** — onchain supply vs issuer attestation, with a flag
  when they diverge.
- **Embeddable widget** — the same disclosure rendered at the point of trade
  inside a wallet or DEX, rather than on a page someone has to visit.
- **Onchain attestation trail** — hash the registry on each update so the rights
  data has a tamper-evident, timestamped history.

---

## License

MIT.

SolLens displays information for educational purposes. It is not investment advice,
not a solicitation, and not a substitute for reading an issuer's own documentation.
