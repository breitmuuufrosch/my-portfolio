import { Account, AccountHistory, AccountSummary } from '@backend/types/account';
import { Trade } from '@backend/types/trade';
import {
  AccountTransaction,
  PorftolioQuote,
  Security,
  SecurityHistory,
  SecurityQuote,
} from '@backend/types/security';
import { Currency } from '@backend/types/currency';
import { dateString } from 'src/data/formatting';

export const getServiceData = async <T>(uri: string): Promise<T> => {
  const response = await fetch(uri, {
    method: 'GET',
  });
  const jsonResponse = await response.json();
  return jsonResponse;
};

export const getCurrencies = async (): Promise<Currency[]> => (
  getServiceData<Currency[]>('http://localhost:3333/currencies')
);

export const getAccounts = async (): Promise<Account[]> => (
  getServiceData<Account[]>('http://localhost:3333/accounts')
);

export const getAccountSummary = async (): Promise<AccountSummary[]> => (
  getServiceData<AccountSummary[]>('http://localhost:3333/accounts/summary')
);

export const getAccountHistory = async (accountId: number): Promise<AccountHistory[]> => (
  getServiceData<AccountHistory[]>(`http://localhost:3333/accounts/${accountId}/histories`)
);

export const getAccountHistoryByType = async (type: string): Promise<AccountHistory[]> => (
  getServiceData<AccountHistory[]>(`http://localhost:3333/histories/accounts/?type=${type}`)
);

export const getAccountTransactionById = async (id: number): Promise<AccountTransaction> => (
  getServiceData<AccountTransaction>(`http://localhost:3333/histories/accounts/${id}`)
);

export const getTrades = async (): Promise<Trade[]> => getServiceData<Trade[]>('http://localhost:3333/trades');

export const getSecurities = async (): Promise<Security[]> => (
  getServiceData<Security[]>('http://localhost:3333/securities')
);

export const getSecurityQuotes = async (symbol: string, startDate: Date, endDate: Date): Promise<SecurityQuote[]> => (
  getServiceData<SecurityQuote[]>(
    `http://localhost:3333/securities/${symbol}/prices?start=${dateString(startDate)}&end=${dateString(endDate)}`,
  )
);

export const getSecurityTransactionDetailsS = async (symbol: string): Promise<SecurityHistory[]> => (
  getServiceData<SecurityHistory[]>(`http://localhost:3333/securities/${symbol}/histories`)
);

export const getSecurityHistoryById = async (id: number): Promise<SecurityHistory> => (
  getServiceData<SecurityHistory>(`http://localhost:3333/histories/securities/${id}`)
);

export const getPortfolioQuotes = async (
  currency: string,
  startDate: Date,
  endDate: Date,
): Promise<PorftolioQuote[]> => (
  getServiceData<PorftolioQuote[]>(
    `http://localhost:3333/histories/portfolios/${currency}?start=${dateString(startDate)}&end=${dateString(endDate)}`,
  )
);
