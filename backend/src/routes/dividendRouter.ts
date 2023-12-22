import express, { Request, Response } from 'express';
import * as tradeModel from '../models/trade';
import * as yahooFinance from '../models/yahooApi';
import { DividendInfo } from '../types/security';
import { Trade } from '../types/trade';
import { handleRequest } from '../utils/server';

const dividendRouter = express.Router();

dividendRouter.get('/', async (req: Request, res: Response) => {
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

dividendRouter.get('/:id', async (req: Request, res: Response) => {
  const symbol = String(req.params.id);
  handleRequest<any>(res, yahooFinance.getDividends(symbol));
});

export { dividendRouter };
