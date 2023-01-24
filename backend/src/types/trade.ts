export interface Trade {
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
