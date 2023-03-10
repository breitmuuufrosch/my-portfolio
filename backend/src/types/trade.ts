export interface Trade {
  accountId: number,
  name: string,
  symbol: string,
  quoteType: string,
  currency: string,
  entryPrice: number,
  entryPriceAll: number,
  amount: number,
  exitPrice: number,
  lastPrice: number,
  lastDate: Date,
  profitLoss: number,
  profitLossPercentage: number,
}

export interface TradeDiversification {
  id: number,
  name: string,
  symbol: string,
  quoteType: string,
  sector: string,
  industry: string,
  exitPrice: number,
  currency: string,
  realEstate: string,
  account: string,
  depot: string,
}
