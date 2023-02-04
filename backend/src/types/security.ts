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

export interface SecurityHistory {
  id: number,
  type: string,
  accountId: number,
  accountTransactionId: number,
  securityId: number,
  symbol: string,
  nameShort: string,
  date: Date,
  price: number,
  amount: number,
  currency: string,
  total: number,
  value: number,
  fee: number,
  tax: number,
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
  entryPrice: number,
  close: number,
  currency: string,
}

export interface SecurityTransaction {
  security_id: number,
  symbol: string,
  date: Date,
  type: string,
  acount_id: number,
  currency: string,
  price: number,
  amount: number,
  value: number,
  fee: number,
  tax: number,
}

export interface SecurityTransactionForeign extends SecurityTransaction {
  exchange_to_value: number,
  exchange_from_currency: string,
  exchange_from_value: number,
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
  from_value: number,
  from_fee: number,
  from_tax: number,
  to_account_id: number,
  to_currency: string,
  to_value: number,
  to_fee: number,
  to_tax: number,
}

export const transactionTotal = (transaction: SecurityHistory) => {
  if (['buy', 'posting'].includes(transaction.type)) {
    return transaction.value + transaction.fee + transaction.tax;
  }

  return transaction.value - transaction.fee - transaction.tax;
};
