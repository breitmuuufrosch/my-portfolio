import express, { Request, Response } from 'express';
import * as securityModel from '../models/security';
import * as securityHistoryModel from '../models/securityPrice';
import * as securityTransactionModel from '../models/securityTransaction';
import * as yahooFinance from '../models/yahooApi';
import { PorftolioQuote, Security, SecurityTransaction } from '../types/security';
import { handleRequest } from '../utils/server';

const securityRouter = express.Router();

securityRouter.get('/', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  handleRequest<Security[]>(res, securityModel.findAll(userId));
});

securityRouter.post('/', async (req: Request, res: Response) => {
  const { symbol, isin } = req.body;
  const security = await yahooFinance.findOne(symbol, isin);
handleRequest<number>(res, securityModel.create(security));
});

securityRouter.get('/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);
  handleRequest<Security>(res, securityModel.findOne(symbol));
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
      securityTransactionModel.findAll({ userId, securityId: security.id })
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
      securityTransactionModel.findAll({ userId, accountId, securityId: security.id })
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
