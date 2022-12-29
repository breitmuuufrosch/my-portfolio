export interface Security {
  id: number,
  symbol: string,
  quoteType: string,
  nameLong?: string,
  nameShort?: string,
  currency: string,
  isin?: string,
  valor?: string,
  info: { [id: string]: string },
  holdings?: number,
  source: string,
  sourceUrl?: string,
}

export interface SecurityQuote {
  security_id: number,
  date: Date,
  high: number,
  low: number,
  open: number,
  close: number,
  adjClose: number,
  volume: number,
}

export interface PorftolioQuote {
  date: Date,
  value: number,
  currency: string,
}

export interface SecurityTransaction {
  security_id: number,
  symbol: string,
  symbol_id: number,
  date: Date,
  type: string,
  acount_id: number,
  currency: string,
  price: number,
  aboumt: number,
  total: number,
  fee: number,
  tax: number,
}

export interface SecurityTransactionForeign extends SecurityTransaction {
  exchange_to_total: number,
  exchange_from_currency: string,
  exchange_from_total: number,
  exchange_from_fee: number,
  exchange_from_tax: number,
  exchange_from_account_id: number,
}

export enum AccountTransactionType {
  payment,
  payout,
  transfer,
  fee,
  fee_refund,
  tax,
  tax_refund,
  interest,
  interest_charge,
}

export interface AccountTransaction {
  date: Date,
  type: AccountTransactionType,
  from_account_id: number,
  from_currency: string,
  from_total: number,
  from_fee: number,
  from_tax: number,
  to_account_id: number,
  to_currency: string,
  to_total: number,
  to_fee: number,
  to_tax: number,
}
