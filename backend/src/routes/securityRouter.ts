import express, { Request, Response } from 'express';
import * as securityModel from '../models/security';
import * as tradeModel from '../models/trade';
import * as yahooFinance from '../models/yahooApi';
import { Security } from '../types/security';
import { Trade } from '../types/trade';
import { historyRouter } from './security/historyRouter';
import { transactionRouter } from './security/transactionRouter';

const securityRouter = express.Router();

securityRouter.use('/history', historyRouter);
securityRouter.use('/transaction', transactionRouter);

securityRouter.get('/dividends', async (req: Request, res: Response) => {
  type TradeInfo = [string, number];

  tradeModel.findAll()
    .then((trades: Trade[]) => trades.map((trade) => [trade.symbol, trade.number]))
    .then((securities: TradeInfo[]) => {
      const allDividends = securities.map((trade: TradeInfo) => (
        new Promise<{ symbol: string, total: number }>((resolve, reject) => {
          yahooFinance.getDividends(trade[0])
            .then((divResult) => {
              if (Number.isNaN(divResult.dividendRate) === false) {
                resolve({ symbol: trade[0], total: divResult.dividendRate * trade[1] });
              } else {
                resolve({ symbol: trade[0], total: 0 });
              }
            })
            .catch((err: Error) => resolve({ symbol: trade[0], total: 0 }));
        })
      ));

      Promise.all(allDividends)
        .then((divResult) => {
          console.log(divResult);
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
    .catch((err: Error) => { res.status(500).json({ message: err.message }); })
});

securityRouter.get('/:id', async (req: Request, res: Response) => {
  const symbol = String(req.params.id);
  securityModel.findOne(symbol)
    .then((security: Security) => { res.status(200).json(security); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
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

    return new Promise((resolve, reject) => {
      yahooFinance.findOne(symbol, isin)
        .then((security: Security) => {
          if (security.currency !== 'XXX') {
            console.log(symbol, 'ok');
            resolve(security);
          }

          console.log(symbol, 'nok');
          throw new Error();
        })
        .catch(() => {
          const { name, quote_type, currency } = item;
          const security = {
            symbol: symbol,
            quoteType: quote_type,
            nameLong: name,
            nameShort: name,
            currency,
            isin,
            info: {},
          };
          resolve(security);
        })
    })
  });

  Promise.all(securities)
    .then((securitiesResult) => securityModel.createMultiple(securitiesResult))
    .then((message) => { res.status(200).json({ data: message }); })
    .catch((err: Error) => { res.status(500).json({ message: err }); });
});

export { securityRouter };
