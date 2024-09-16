import yahooFinance from 'yahoo-finance2';
import { Security, SecurityPrice } from '../types/security';
import { ChartResultArray } from 'yahoo-finance2/dist/esm/src/modules/chart';

const mapMarket = {
  'SW': 'SWX',
};

const endpoint = 'https://api.simplywall.st/graphql';
const callGraphql = async (query: any, variables: any): Promise<any> => new Promise((resolve, reject) => {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MY_SIMPLY_WALL_STREET_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then((s) => s.json())
    .then((s) => resolve(s))
    .catch((err) => reject(err));
});


export const getHistory = async (symbol: string): Promise<SecurityPrice[]> => new Promise((resolve, reject) => {
  let [symbolName, market] = symbol.split('.');

  if (market in mapMarket) {
    market = mapMarket[market];
  }

  const endpoint = 'https://api.simplywall.st/graphql';
  const query = `query companyByExchangeAndTickerSymbol($exchange: String!,$symbol:String!) {
        companyByExchangeAndTickerSymbol(exchange: $exchange, tickerSymbol:$symbol) {
           closingPrices
        }
    }`;
  const variables = { "exchange": market, "symbol": symbolName };

  callGraphql(query, variables)
    .then((s) => {
      const closingPrices = s?.data?.companyByExchangeAndTickerSymbol?.closingPrices;
      const securityPrices = [];
      for (let date in closingPrices) {
        let price = closingPrices[date];
        securityPrices.push({
          security_id: -1,
          date: new Date(date),
          open: price,
          high: price,
          low: price,
          close: price,
          adjClose: null,
          volume: null,
        } as SecurityPrice);
      }
      resolve(securityPrices);
    })
    .catch((err) => reject(err));
});
