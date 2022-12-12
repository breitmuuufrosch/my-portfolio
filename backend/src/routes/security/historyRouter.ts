import express, { Request, Response } from 'express';
import * as securityModel from '../../models/security';
import * as yahooFinance from '../../models/yahooApi';
import { Security, SecurityQuote } from '../../types/security';

const historyRouter = express.Router();

historyRouter.put('/:symbol', async (req: Request, res: Response) => {
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

historyRouter.post('/update-all', async (req: Request, res: Response) => {
  securityModel.findAll()
    .then((securities: Security[]) => {
      const allUpdates = securities.map((security: Security) => new Promise((resolve, reject) => {
        yahooFinance.getHistory(security.symbol)
          .then((history: SecurityQuote[]) => {
            if (history.length === 0) { return resolve({ symbol: security.symbol, success: true }); }
            const securityHistory = history.map((row) => ({
              ...row,
              security_id: security.id,
            }));

            securityModel.updateHistory(securityHistory)
              .then(() => resolve({ symbol: security.symbol, success: true }))
              .catch(() => reject({ symbol: security.symbol, success: false }));
          });
      }))
      Promise.all(allUpdates)
        .then(() => res.status(200).json('successfully updated'))
        .catch((err: Error) => { throw err; })
    })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); })
});

export { historyRouter };
