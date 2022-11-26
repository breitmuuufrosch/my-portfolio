export interface Security {
  symbol: string,
  quoteType: string,
  longName?: string,
  shortName?: string,
  currency: string,
  isin: string,
  valor?: string,
  info: { [id: string]: string },
}
