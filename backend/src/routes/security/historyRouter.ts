import express, { Request, Response } from 'express';
import * as securityModel from "../../models/security";
import * as yahooFinance from '../../models/yahooApi';

const historyRouter = express.Router();

historyRouter.put('/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);

  const promiseSecurity = securityModel.findOne(symbol);
  const promiseHistory = yahooFinance.getHistory(symbol);

  Promise.all([promiseSecurity, promiseHistory])
    .then(([security, history]) => {
      const securityHistory = history.map(row => ({
        ...row,
        security_id: security.id,
      }));

      securityModel.updateHistory(securityHistory)
        .then((message: string) => { res.status(200).json({ message, data: securityHistory }); })
        .catch((err: any) => { throw err; });
    })
    .catch((err: any) => {
      res.status(500).json({ message: err.message });
    });
});

export { historyRouter };
