import { Trade } from '@backend/types/trade';
import { getServiceData } from './service';

export const getTrades = async (): Promise<Trade[]> => getServiceData<Trade[]>('http://localhost:3333/trades');
