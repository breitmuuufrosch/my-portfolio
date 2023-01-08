import express, { Request, Response } from 'express';
import * as securityModel from '../models/security';
import * as securityHistoryModel from '../models/securityHistory';
import * as tradeModel from '../models/trade';
import * as yahooFinance from '../models/yahooApi';
import { Security, SecurityHistory, SecurityQuote } from '../types/security';
import { Trade } from '../types/trade';
import { transactionRouter } from './security/transactionRouter';

const securityRouter = express.Router();

securityRouter.use('/transaction', transactionRouter);

securityRouter.get('/dividends', async (req: Request, res: Response) => {
  type TradeInfo = [string, number];

  tradeModel.findAll()
    .then((trades: Trade[]) => trades.map((trade) => [trade.symbol, trade.number]))
    .then((securities: TradeInfo[]) => {
      const allDividends = securities.map((trade: TradeInfo) => (
        new Promise<{ symbol: string, total: number }>((resolve) => {
          yahooFinance.getDividends(trade[0])
            .then((divResult) => {
              if (Number.isNaN(divResult.dividendRate) === false) {
                resolve({ symbol: trade[0], total: divResult.dividendRate * trade[1] });
              } else {
                resolve({ symbol: trade[0], total: 0 });
              }
            })
            .catch(() => resolve({ symbol: trade[0], total: 0 }));
        })
      ));

      Promise.all(allDividends)
        .then((divResult) => {
          let total = 0;
          divResult.forEach((dividend) => {
            total += Number.isNaN(dividend.total) ? 0 : dividend.total;
          });

          res.status(200).json({ all: divResult, total });
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
  securityModel.findAll()
    .then((securities: Security[]) => { res.status(200).json(securities); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

securityRouter.get('/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);
  securityModel.findOne(symbol)
    .then((security: Security) => { res.status(200).json(security); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

securityRouter.get('/:securityId/histories', async (req: Request, res: Response) => {
  const { securityId } = req.params;
  securityHistoryModel.findAll({ securityId: Number(securityId) })
    .then((currencies: SecurityHistory[]) => { res.status(200).json(currencies); })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

securityRouter.get('/:symbol/prices', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);

  securityModel.findOne(symbol)
    .then((security: Security) => {
      securityModel.getHistory(security.id)
        .then((securityQuotes: SecurityQuote[]) => res.status(200).json(securityQuotes));
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
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

      securityModel.updateHistory(securityHistory)
        .then((message: string) => { res.status(200).json({ message, data: securityHistory }); })
        .catch((err: Error) => { throw err; });
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

securityRouter.post('/', async (req: Request, res: Response) => {
  const { symbol, isin } = req.body;
  const security = await yahooFinance.findOne(symbol, isin);

  securityModel.create(security)
    .then(() => { res.status(200).json(security); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
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
            quoteType: item.quote_type,
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
