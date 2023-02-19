export type AccountTransactionType = (
  'payment' | 'payout' | 'transfer' | 'fee' | 'fee_refund' | 'tax' | 'tax_refund' | 'interest' | 'interest_charge'
);

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
