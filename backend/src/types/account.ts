import { RowDataPacket } from 'mysql2';

export type AccountTransactionType = (
  'payment' | 'payout' | 'transfer' | 'fee' | 'fee_refund' | 'tax' | 'tax_refund' | 'interest' | 'interest_charge'
);

export interface Depot {
  id: number,
  name: string,
}

export interface Account {
  id: number,
  name: string,
  currency: string,
  depotId: number,
}

export interface AccountSummary {
  id: number,
  name: string,
  currency: string,
  balance: number
}

export interface AccountTransaction {
  date: Date,
  type: AccountTransactionType,
  fromAccountId: number,
  fromCurrency: string,
  fromValue: number,
  fromFee: number,
  fromTax: number,
  toAccountId: number,
  toCurrency: string,
  toValue: number,
  toFee: number,
  toTax: number,
}

export const rowToAccountTransaction = (row: RowDataPacket): AccountTransaction => ({
  date: row.date,
  type: row.type,
  fromAccountId: row.from_account_id,
  fromCurrency: row.from_currency,
  fromValue: Number(row.from_value),
  fromFee: Number(row.from_fee),
  fromTax: Number(row.from_tax),
  toAccountId: row.to_account_id,
  toCurrency: row.to_currency,
  toValue: Number(row.to_value),
  toFee: Number(row.to_fee),
  toTax: Number(row.to_tax),
});

export interface AccountTransactionSummary {
  id: number,
  type: AccountTransactionType,
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

export const rowToAccountTransactionSummary = (row: RowDataPacket): AccountTransactionSummary => ({
  id: row.id,
  accountId: row.account_id,
  securityId: row.security_id,
  symbol: row.symbol,
  nameShort: row.name_short,
  date: row.date,
  type: row.type,
  currency: row.currency,
  total: Number(row.total),
  value: Number(row.value),
  fee: Number(row.fee),
  tax: Number(row.tax),
});
