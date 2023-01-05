import { AccountHistory, AccountSummary } from '@backend/types/account';
import { Trade } from '@backend/types/trade';
import {
  PorftolioQuote,
  Security,
  SecurityQuote,
  SecurityTransaction,
} from '@backend/types/security';

export const getServiceData = async <T>(uri: string): Promise<T> => {
  const response = await fetch(uri, {
    method: 'GET',
  });
  const jsonResponse = await response.json();
  return jsonResponse;
};

export const getAccountSummary = async (): Promise<AccountSummary[]> => (
  getServiceData<AccountSummary[]>('http://localhost:3333/accounts/summary')
);

export const getAccountHistory = async (accountId: number): Promise<AccountHistory[]> => (
  getServiceData<AccountHistory[]>(`http://localhost:3333/accounts/history/${accountId}`)
);

export const getTrades = async (): Promise<Trade[]> => getServiceData<Trade[]>('http://localhost:3333/trades');

export const getSecurities = async (): Promise<Security[]> => (
  getServiceData<Security[]>('http://localhost:3333/securities')
);

export const getSecurityQuotes = async (symbol: string): Promise<SecurityQuote[]> => (
  getServiceData<SecurityQuote[]>(`http://localhost:3333/securities/history/${symbol}`)
);

export const getPortfolioQuotes = async (currency: string): Promise<PorftolioQuote[]> => (
  getServiceData<PorftolioQuote[]>(`http://localhost:3333/securities/history/portfolio/${currency}`)
);

export const getSecurityTransactionDetails = async (type: string): Promise<SecurityTransaction[]> => (
  getServiceData<SecurityTransaction[]>(`http://localhost:3333/securities/transaction/type/${type}`)
);

export const getSecurityTransactionDetailsS = async (securityId: number): Promise<SecurityTransaction[]> => (
  getServiceData<SecurityTransaction[]>(`http://localhost:3333/securities/transaction/security/${securityId}`)
);
