import { getServiceData } from './service';

export type Dividend = {
  symbol: string,
  total: number,
};

export type DividendTotal = {
  all: Dividend[],
  total: number,
};

export const getDividends = async (): Promise<DividendTotal> => (
  getServiceData<DividendTotal>('http://localhost:3333/securities')
);
