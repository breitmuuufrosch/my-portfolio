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
  total_chf: number,
  fee_chf: number,
  tax_chf: number,
  account_id_chf: number,
}
