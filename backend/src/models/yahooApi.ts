import yahooFinance from 'yahoo-finance2';
import { Security, SecurityQuote } from '../types/security';

export const findOne = async (symbol: string, isin?: string): Promise<Security> => {
  const response = await yahooFinance.quote(symbol);
  const security: Security = {
    id: -1,
    symbol,
    isin,
    nameShort: response?.shortName ?? '',
    nameLong: response?.longName ?? '',
    currency: response?.currency || 'XXX',
    quoteType: response?.quoteType,
    info: response,
  };
  return security;
};

// export const findOne = async (symbol: string, isin: string, callback: Function) => {
//   try {
//     const response = await yahooFinance.quote(symbol);
//     const security: Security = {
//       symbol,
//       isin,
//       shortName: response.shortName,
//       longName: response.longName,
//       currency: response.currency || 'XXX',
//       quoteType: response.quoteType,
//       info: response,
//     };
//     callback(null, security);
//   } catch (e: unknown) {
//     console.error(e);
//     callback(e);
//   }
// };

// export const findOne = async (symbol: string, callback: Function) => {
//     try {
//         callback(null, await yahooFinance.quoteSummary(symbol, {
//   modules: ["price","summaryDetail", "calendarEvents" ] }));
//     } catch (e: unknown) {
//         console.error(e);
//         callback(e);
//     }
// }

export const getDividends = async (symbol: string) => {
  const order: any = await yahooFinance.quoteSummary(symbol, { modules: ['price', 'summaryDetail', 'calendarEvents'] });
  const dividend = {
    symbol,
    dividendRate: order.summaryDetail.dividendRate,
    dividendYield: order.summaryDetail.dividendYield,
    exDividendDate: order.summaryDetail.exDividendDate,
    currencty: order.summaryDetail.currency,
    total: 0,
    all: order,
  };
  return dividend;
};

export const getHistory = async (symbol: string): Promise<SecurityQuote[]> => {
  const test: any = await yahooFinance.historical(symbol, {period1: '2000-01-01'});

  return test;
};