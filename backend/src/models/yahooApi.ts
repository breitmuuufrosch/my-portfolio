import yahooFinance from 'yahoo-finance2';
import { Security } from '../types/security';

export const findOne = async (symbol: string, isin: string, callback: Function) => {
  try {
    const response = await yahooFinance.quote(symbol);
    const security: Security = {
      symbol,
      isin,
      shortName: response.shortName,
      longName: response.longName,
      currency: response.currency || 'XXX',
      quoteType: response.quoteType,
      info: response,
    };
    callback(null, security);
  } catch (e: unknown) {
    console.error(e);
    callback(e);
  }
};

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
