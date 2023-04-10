import yahooFinance from 'yahoo-finance2';
import { Security, SecurityPrice } from '../types/security';

export const findOne = async (symbol: string, isin?: string): Promise<Security> => {
  const response = await yahooFinance.quote(symbol);
  const responseSummary = await yahooFinance.quoteSummary(symbol, { modules: [ "assetProfile" ] });

  // if (symbol === 'ABBN.SW') {
  //   console.log('here we are');
  //   // console.log(response);
  //   // console.log('here we are');
  //   // console.log(responseSummary);
  //   console.log({...response, ...responseSummary});
  // }

  const security: Security = {
    id: -1,
    symbol,
    isin,
    nameShort: response?.shortName ?? '',
    nameLong: response?.longName ?? '',
    currency: response?.currency || 'XXX',
    quoteType: response?.quoteType,
    info: {...response, ...responseSummary},
    source: 'yahoo',
  };
  if (security.nameLong === '') {
    security.nameLong = security.nameShort;
  }
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

// eslint-disable-next-line
export const getDividends = async (symbol: string): Promise<any> => new Promise((resolve, reject) => {
  yahooFinance.quoteSummary(symbol, { modules: ['price', 'summaryDetail', 'calendarEvents'] })
    .then((order) => {
      if (symbol === 'SCMN.SW') {
        // console.log(order);
      }
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
  yahooFinance.historical(symbol, { period1: '2000-01-01' })
    .then((quotes) => resolve(quotes.map((item) => item as SecurityPrice)))
    .catch(() => resolve([]));
});
