export interface BasicCurrency {
  symbol: string,
}

export interface Currency extends BasicCurrency {
  description: string,
}

export interface ForexPrice {
  currency_from: string,
  currency_to: string,
  date: Date,
  high: number,
  low: number,
  open: number,
  close: number,
  adjClose: number,
  volume: number,
}