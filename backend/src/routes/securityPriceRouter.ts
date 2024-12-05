import express, { Request, Response } from 'express';
import * as securityModel from '../models/security';
import * as securityPriceModel from '../models/securityPrice'
import * as yahooFinance from '../data/yahooApi';
import * as simplyWallStreet from '../data/simplyWallSteet';
import { Security, SecurityPrice } from '../types/security';

const securityPriceRouter = express.Router();

securityPriceRouter.post('/update-all', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);

  securityModel.findAll(Number.isNaN(userId) ? -1 : userId)
    .then((securities: Security[]) => {
      const allUpdates = securities
        .map((security: Security) => ({ id: security.id, symbol: security.symbol, source: security.source, lastUpdated: security.lastPriceUpdate }))
        .filter((item, i, ar) => ar.map(x => x.symbol).indexOf(item.symbol) == i)
        .map((security) => new Promise((resolve, reject) => {
          let historyPromise;
          let yesterday = new Date(Date.now() - 86400000); // that is: 24 * 60 * 60 * 1000
          let earlier = yesterday < security.lastUpdated ? yesterday : security.lastUpdated;

          if (security.source === 'simplywallstreet') {
            historyPromise = simplyWallStreet.getHistory(security.symbol);
          } else {
            historyPromise = yahooFinance.getHistory(security.symbol, earlier);
          }

          historyPromise
            .then((history: SecurityPrice[]) => {
              if (history.length === 0) { return resolve({ symbol: security.symbol, success: true }); }
              const securityHistory = history.map((row) => ({
                ...row,
                security_id: security.id,
              }));

              securityPriceModel.updateHistory(securityHistory)
                .then(() => resolve({ symbol: security.symbol, success: true }))
                .catch(() => reject(new Error(`${security.symbol} success: false`)));
            });
        }));
      Promise.all(allUpdates)
        .then(() => res.status(200).json('successfully updated'))
        .catch((err: Error) => { throw err; });
    })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

export { securityPriceRouter };
