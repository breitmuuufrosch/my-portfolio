import { AccountSummary } from '@backend/types/account';
import { getServiceData } from './service';

export const getAccountSummary = async (): Promise<AccountSummary[]> => (
  getServiceData<AccountSummary[]>('http://localhost:3333/accounts')
);
