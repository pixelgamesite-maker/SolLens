import type { Token } from "@/types";

const FIELDS: { term: string; key: keyof Token["rights"]; why: string }[] = [
  {
    term: "Legal wrapper",
    key: "legalWrapper",
    why: "A tracker certificate and a 1:1 custodied share are different instruments.",
  },
  {
    term: "Custody",
    key: "custodyModel",
    why: "Who holds the underlying shares, and in which jurisdiction.",
  },
  {
    term: "Dividends",
    key: "dividendHandling",
    why: "Cash pass-through, quantity adjustment, or nothing at all.",
  },
  {
    term: "Voting",
    key: "votingRights",
    why: "Whether you can vote the shares behind the token.",
  },
  {
    term: "Redemption",
    key: "redemption",
    why: "Whether you can swap the token for the actual share, and who qualifies.",
  },
  {
    term: "Corporate actions",
    key: "corporateActionPolicy",
    why: "How splits, delistings and rebalances pass through.",
  },
];

export function RightsPanel({ token }: { token: Token }) {
  const { rights } = token;

  return (
    <div>
      {FIELDS.map(({ term, key, why }) => {
        const value = rights[key] as string | null;
        return (
          <div
            key={term}
            className="grid gap-1 border-b border-hairline-soft py-4 sm:grid-cols-[190px_1fr] sm:gap-6"
          >
            <dt className="text-[14px] text-bright">{term}</dt>
            <dd>
              {value ? (
                <span className="text-[14px] leading-relaxed text-bright/90">
                  {value}
                </span>
              ) : (
                <span className="text-[14px] leading-relaxed text-muted">
                  Not yet read from the issuer's documents.
                  <span className="mt-0.5 block text-[13px] text-faint">{why}</span>
                </span>
              )}
            </dd>
          </div>
        );
      })}

      <div className="grid gap-1 border-b border-hairline-soft py-4 sm:grid-cols-[190px_1fr] sm:gap-6">
        <dt className="text-[14px] text-bright">Not available in</dt>
        <dd className="text-[14px] leading-relaxed">
          {rights.excludedJurisdictions ? (
            <span className="text-bright/90">
              {rights.excludedJurisdictions.join(", ")}
            </span>
          ) : (
            <span className="text-muted">
              Not yet read from the issuer's documents.
            </span>
          )}
        </dd>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-faint">
        {token.sourceUrl ? (
          <>
            Read from{" "}
            <a
              href={token.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-discount underline underline-offset-2"
            >
              the issuer's terms
            </a>
            {token.verifiedAt && <> on {token.verifiedAt}</>}.
          </>
        ) : (
          <>
            No source document recorded yet. Until one is, treat every field
            above as unknown rather than absent.
          </>
        )}
      </p>
    </div>
  );
}
