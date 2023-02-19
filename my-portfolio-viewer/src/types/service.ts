import {
  Account,
  AccountTransaction,
  AccountTransactionSummary,
  AccountSummary,
} from '@backend/types/account';
import {
  PorftolioQuote,
  Security,
  SecurityTransactionSummary,
} from '@backend/types/security';
import { Trade } from '@backend/types/trade';
import { Currency } from '@backend/types/currency';
import { isoDate } from 'src/data/formatting';

const USER_ID = 1;

export const getServiceData = async <T>(uri: string): Promise<T> => {
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      // Authorization: `Bearer ${USER_ID}`,
      'x-user-id': `${USER_ID}`,
    },
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

export const getAccountHistory = async (accountId: number): Promise<AccountTransactionSummary[]> => (
  getServiceData<AccountTransactionSummary[]>(`http://localhost:3333/accounts/${accountId}/histories`)
);

export const getAccountHistoryByType = async (type: string): Promise<AccountTransactionSummary[]> => (
  getServiceData<AccountTransactionSummary[]>(`http://localhost:3333/histories/accounts/?type=${type}`)
);

export const getAccountTransactionById = async (id: number): Promise<AccountTransaction> => (
  getServiceData<AccountTransaction>(`http://localhost:3333/histories/accounts/${id}`)
);

export const getTrades = async (): Promise<Trade[]> => getServiceData<Trade[]>('http://localhost:3333/trades');

export const getSecurities = async (): Promise<Security[]> => (
  getServiceData<Security[]>('http://localhost:3333/securities')
);

export const getSecurityQuotes = async (
  symbol: string,
  startDate: Date,
  endDate: Date,
): Promise<PorftolioQuote[]> => (
  getServiceData<PorftolioQuote[]>(
    `http://localhost:3333/securities/${symbol}/prices?start=${isoDate(startDate)}&end=${isoDate(endDate)}`,
  )
);

export const getSecurityTransactionDetailsS = async (symbol: string): Promise<SecurityTransactionSummary[]> => (
  (await getServiceData<SecurityTransactionSummary[]>(`http://localhost:3333/securities/${symbol}/transactions`))
    .map((sh: SecurityTransactionSummary) => ({ ...sh, date: new Date(sh.date) }))
);

export const getSecurityHistoryById = async (id: number): Promise<SecurityTransactionSummary> => (
  getServiceData<SecurityTransactionSummary>(`http://localhost:3333/histories/securities/${id}`)
);

export const getPortfolioQuotes = async (
  currency: string,
  startDate: Date,
  endDate: Date,
): Promise<PorftolioQuote[]> => (
  getServiceData<PorftolioQuote[]>(
    `http://localhost:3333/histories/portfolios/${currency}?start=${isoDate(startDate)}&end=${isoDate(endDate)}`,
  )
);
