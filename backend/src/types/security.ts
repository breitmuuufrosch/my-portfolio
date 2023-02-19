export type SecurityTransactionType = 'buy' | 'sell' | 'posting' | 'dividend' | 'tax_refund';

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

export interface SecurityTransactionSummary {
  id: number,
  type: SecurityTransactionType,
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

export interface SecurityPrice {
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
  securityId: number,
  symbol: string,
  date: Date,
  type: SecurityTransactionType,
  accountId: number,
  currency: string,
  price: number,
  amount: number,
  value: number,
  fee: number,
  tax: number,
}

export interface SecurityTransactionForeign extends SecurityTransaction {
  exchangeToValue: number,
  exchangeFromCurrency: string,
  exchangeFromValue: number,
  exchangeFromFee: number,
  exchangeFromTax: number,
  exchangeFromAccountId: number,
}

export const transactionTotal = (transaction: SecurityTransaction) => {
  if (['buy', 'posting'].includes(transaction.type)) {
    return transaction.value + transaction.fee + transaction.tax;
  }

  return transaction.value - transaction.fee - transaction.tax;
};
