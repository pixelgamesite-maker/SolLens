/** null means: not yet read from a source document. Never a guess. */
export interface TokenRights {
  legalWrapper: string | null;
  custodyModel: string | null;
  dividendHandling: string | null;
  votingRights: string | null;
  redemption: string | null;
  corporateActionPolicy: string | null;
  excludedJurisdictions: string[] | null;
}

export interface Token {
  id: string;
  symbol: string;
  underlyingTicker: string;
  name: string;
  issuer: string;
  mintAddress: string;
  rights: TokenRights;
  /** Link to the issuer document these fields were read from */
  sourceUrl: string | null;
  /** ISO date the rights were last checked against that document */
  verifiedAt: string | null;
}

export function verifiedCount(rights: TokenRights): number {
  return Object.values(rights).filter((v) => v != null).length;
}

export const RIGHTS_TOTAL = 7;
