export interface Token {
  id: string;
  symbol: string;
  underlyingTicker: string;
  name: string;
  issuer: string;
  legalWrapper: string;
  custodyModel: string;
  dividendHandling: string;
  votingRights: string;
  redemption: string;
  excludedJurisdictions: string[];
  corporateActionPolicy: string;
  mintAddress: string;
  sourceUrl: string;
}
