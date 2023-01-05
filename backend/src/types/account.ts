export interface AccountSummary {
  id: number,
  name: string,
  currency: string,
  balance: number
}

export interface AccountHistory {
  id: number,
  type: string,
  accountId: number,
  securityId: number,
  symbol: string,
  nameShort: string,
  date: Date,
  currency: string,
  total: number,
  value: number,
  fee: number,
  tax: number,
}
