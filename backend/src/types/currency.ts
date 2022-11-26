export interface BasicCurrency {
  symbol: string,
}

export interface Currency extends BasicCurrency {
  description: string,
}
