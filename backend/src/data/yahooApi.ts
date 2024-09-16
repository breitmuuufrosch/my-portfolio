import yahooFinance from 'yahoo-finance2';
import { Security, SecurityPrice } from '../types/security';
import { ChartResultArray } from 'yahoo-finance2/dist/esm/src/modules/chart';

export const findOne = async (symbol: string, isin?: string): Promise<Security> => {
  const response = await yahooFinance.quote(symbol);
  const responseSummary = await yahooFinance.quoteSummary(symbol, { modules: ["assetProfile"] }).catch((r) => { console.error(r); return {}; });

  const security: Security = {
    id: -1,
    symbol,
    isin,
    nameShort: response?.shortName ?? '',
    nameLong: response?.longName ?? '',
    currency: response?.currency || 'XXX',
    quoteType: response?.quoteType,
    info: { ...response, ...responseSummary },
    source: 'yahoo',
  };
  if (security.nameLong === '') {
    security.nameLong = security.nameShort;
  }
  return security;
};

// eslint-disable-next-line
export const getDividends = async (symbol: string): Promise<any> => new Promise((resolve, reject) => {
  yahooFinance.quoteSummary(symbol, { modules: ['price', 'summaryDetail', 'calendarEvents'] })
    .then((order) => {
      const dividend = {
        symbol,
        dividendRate: order.summaryDetail.dividendRate,
        dividendYield: order.summaryDetail.dividendYield,
        exDividendDate: order.summaryDetail.exDividendDate,
        dividendDate: order.calendarEvents.dividendDate,
        currencty: order.summaryDetail.currency,
        total: 0,
        all: order,
      };
      resolve(dividend);
    })
    .catch(reject);
  });

  export const getHistory = async (symbol: string): Promise<SecurityPrice[]> => new Promise((resolve) => {
    yahooFinance.chart(symbol, { period1: '2000-01-01' })
      .then((result: ChartResultArray) => result.quotes
        .map((quote) => ({
          ...quote,
          open: quote.open || null,
          high: quote.high || null,
          low: quote.low || null,
          close: quote.close || null,
          volume: quote.volume || null,
        }) as SecurityPrice)
      )
      .then((quotes) => resolve(quotes.map((item) => item as SecurityPrice)))
      .catch(() => resolve([]));
  });
