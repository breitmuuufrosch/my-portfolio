import { RowDataPacket } from 'mysql2';

export type SecurityTransactionType = 'buy' | 'sell' | 'posting' | 'vesting' | 'dividend' | 'tax_refund';

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
  total: number,
  value: number,
  fee: number,
  tax: number,
}

export interface SecurityTransactionSummary extends SecurityTransaction {
  id: number,
  accountTransactionId?: number,
  // exchangeAccountTransactionId: number,
  moneyId: number,
  nameShort: string,
}

export const rowToSecurityHistory = (row: RowDataPacket): SecurityTransactionSummary => ({
  id: row.id,
  symbol: row.symbol,
  nameShort: row.name_short,
  date: new Date(row.date),
  type: row.type,
  accountId: row.account_id,
  accountTransactionId: row.account_transaction_id,
  securityId: row.security_id,
  moneyId: row.money_id,
  currency: row.currency,
  price: Number(row.price),
  amount: Number(row.amount),
  total: Number(row.total),
  value: Number(row.value),
  fee: Number(row.fee),
  tax: Number(row.tax),
});

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

export interface DividendInfo {
  symbol: string,
  total: number,
  currency: string,
  exDividendDate?: Date,
  payDividendDate?: Date,
}
