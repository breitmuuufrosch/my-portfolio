import express, { Request, Response } from 'express';
import * as securityModel from '../models/security';
import * as securityHistoryModel from '../models/securityHistory';
import * as tradeModel from '../models/trade';
import * as yahooFinance from '../models/yahooApi';
import { PorftolioQuote, Security, SecurityTransaction, DividendInfo } from '../types/security';
import { Trade } from '../types/trade';
import { transactionRouter } from './security/transactionRouter';

const securityRouter = express.Router();

securityRouter.use('/transaction', transactionRouter);

securityRouter.get('/dividends', async (req: Request, res: Response) => {
  type TradeInfo = [string, number, string];
  const userId = Number(req.headers['x-user-id']);

  tradeModel.findAll(userId)
    .then((trades: Trade[]) => trades.map((trade) => [trade.symbol, trade.amount, trade.currency]))
    .then((securities: TradeInfo[]) => {
      const allDividends = securities.map((trade: TradeInfo) => (
        new Promise<DividendInfo>((resolve) => {
          yahooFinance.getDividends(trade[0])
            .then((divResult) => {
              if (Number.isNaN(divResult.dividendRate) === false) {
                resolve({ symbol: trade[0], total: divResult.dividendRate * trade[1], exDividendDate: divResult.exDividendDate, payDividendDate: divResult.dividendDate, currency: divResult.currencty });
              } else {
                resolve({ symbol: trade[0], total: 0, currency: trade[2] });
              }
            })
            .catch(() => resolve(undefined));
        })
      ));

      Promise.all(allDividends)
        .then((divResult) => {
          let total = 0;
          divResult.filter((item) => item && !Number.isNaN(item.total)).forEach((dividend) => {
            total += Number.isNaN(dividend.total) ? 0 : dividend.total;
          });
          console.log(divResult);
          res.status(200).json(divResult.filter((item) => item && !Number.isNaN(item.total)));
        })
        .catch((err: Error) => { throw err; });
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

securityRouter.get('/dividends/:id', async (req: Request, res: Response) => {
  const symbol = String(req.params.id);
  yahooFinance.getDividends(symbol)
    .then((dividend) => { res.status(200).json({ data: dividend }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

securityRouter.get('/', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);

  securityModel.findAll(userId)
    .then((securities: Security[]) => { res.status(200).json(securities); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

securityRouter.post('/', async (req: Request, res: Response) => {
  const { symbol, isin } = req.body;
  const security = await yahooFinance.findOne(symbol, isin);

  securityModel.create(security)
    .then(() => { res.status(200).json(security); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

securityRouter.get('/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);
  securityModel.findOne(symbol)
    .then((security: Security) => { res.status(200).json(security); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

securityRouter.put('/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);

  const promiseSecurity = securityModel.findOne(symbol);
  const promiseHistory = yahooFinance.getHistory(symbol);

  Promise.all([promiseSecurity, promiseHistory])
    .then(([security, history]) => {
      const securityHistory = history.map((row) => ({
        ...row,
        security_id: security.id,
      }));

      securityHistoryModel.updateHistory(securityHistory)
        .then((message: string) => { res.status(200).json({ message, data: securityHistory }); })
        .catch((err: Error) => { throw err; });
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

securityRouter.get('/:symbol/transactions', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const userId = Number(req.headers['x-user-id']);

  securityModel.findOne(symbol)
    .then((security: Security) => {
      securityHistoryModel.findAll({ userId, securityId: security.id })
        .then((currencies: SecurityTransaction[]) => { res.status(200).json(currencies); });
    })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

securityRouter.get('/:symbol/transactions/:accountId', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const userId = Number(req.headers['x-user-id']);
  const accountId = Number(req.params.accountId);

  securityModel.findOne(symbol)
    .then((security: Security) => {
      securityHistoryModel.findAll({ userId, accountId, securityId: security.id })
        .then((currencies: SecurityTransaction[]) => { res.status(200).json(currencies); });
    })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

securityRouter.get('/:symbol/prices', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);
  const userId = Number(req.headers['x-user-id']);
  const startDate = new Date(String(req.query.start));
  const endDate = new Date(String(req.query.end));

  securityModel.findOne(symbol)
    .then((security: Security) => {
      securityHistoryModel.getSecurityHistory(userId, security.id, startDate, endDate)
        .then((portfolioQuotes: PorftolioQuote[]) => res.status(200).json(portfolioQuotes));
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

securityRouter.post('/add-multiple', async (req: Request, res: Response) => {
  const securities: Promise<Security>[] = req.body.map((item) => {
    const { symbol, isin } = item;

    return new Promise((resolve) => {
      yahooFinance.findOne(symbol, isin)
        .then((security: Security) => {
          if (security.currency !== 'XXX') {
            return resolve(security);
          }

          throw new Error();
        })
        .catch(() => {
          const security = {
            symbol,
            quoteType: item.quoteType,
            nameLong: item.name,
            nameShort: item.name,
            currency: item.currency,
            isin,
            info: {},
            source: item.source,
            sourceUrl: item.source_url,
          };
          resolve(security);
        });
    });
  });

  Promise.all(securities)
    .then((securitiesResult) => securityModel.createMultiple(securitiesResult))
    .then((message) => { res.status(200).json({ data: message }); })
    .catch((err: Error) => { res.status(500).json({ message: err }); });
});

export { securityRouter };
