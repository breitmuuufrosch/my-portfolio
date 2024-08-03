import express, { Request, Response } from 'express';
import * as forexPriceModel from '../models/forexPrice'
import * as yahooFinance from '../models/yahooApi';
import { SecurityPrice } from '../types/security';
import { handleRequest } from '../utils/server';

const forexPriceRouter = express.Router();

forexPriceRouter.post('/update-all', async (req: Request, res: Response) => {
  const currencyPairs = [['EUR', 'CHF'], ['USD', 'CHF'], ['GBP', 'CHF']]

  const allUpdates = currencyPairs.map((currencyPair: string[]) => new Promise((resolve, reject) => {
    const [currency_from, currency_to] = currencyPair;
    const forexSymbol = `${currency_from}${currency_to}`;

    yahooFinance.getHistory(`${forexSymbol}=X`)
      .then((history: SecurityPrice[]) => {
        if (history.length === 0) { return resolve({ symbol: forexSymbol, success: true }); }
        const forexHistory = history.map((row) => ({
          ...row,
          currency_from: currency_from,
          currency_to: currency_to,
        }));

        forexPriceModel.updateHistory(forexHistory)
          .then(() => resolve({ symbol: forexSymbol, success: true }))
          .catch((err) => reject(new Error(`${forexSymbol} success: false`)));
      })
  }));

  Promise.all(allUpdates)
    .then(() => res.status(200).json('successfully updated'))
    .catch((err: Error) => { throw err; });
});

forexPriceRouter.get('/:symbol', async (req: Request, res: Response) => {
  handleRequest(res, yahooFinance.getHistory(req.params.symbol));
});

export { forexPriceRouter };
