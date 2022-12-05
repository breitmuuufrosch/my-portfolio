import express, { Request, Response } from 'express';
import * as securityModel from '../models/security';
import * as yahooFinance from '../models/yahooApi';
import { Security } from '../types/security';
import { Trade } from '../types/trade';
import { historyRouter } from './security/historyRouter';
import { transactionRouter } from './security/transactionRouter';

const securityRouter = express.Router();

securityRouter.use('/history', historyRouter);
securityRouter.use('/transaction', transactionRouter);

securityRouter.get('/', async (req: Request, res: Response) => {
  // const securities: { [key: string]: number } = {};
  // securities['ABBN.SW'] = 25;
  // securities['ACLN.SW'] = 1 + 29;
  // securities.ADBE = 2;
  // securities.AMD = 0.265;
  // securities['BEKN.SW'] = 2;
  // securities['BYS.SW'] = 1;
  // securities['RBOT.SW'] = 49;
  // securities['INRG.SW'] = 40;
  // securities['SCWS.SW'] = 950;
  // securities['CSSMIM.SW'] = 1;
  // securities['JFN.SW'] = 6;
  // securities['LISN.SW'] = 0.0002;
  // securities['LOGN.SW'] = 20;
  // securities.MA = 1;
  // securities['NOVN.SW'] = 6;
  // securities.NVDA = 4;
  // securities['OFN.SW'] = 8;
  // securities['ESSN.SW'] = 330;
  // securities.STX = 12 + 9;
  // securities['SREN.SW'] = 11;
  // securities['SCMN.SW'] = 1;
  // securities['SQN.SW'] = 4;
  // securities['UBI.PA'] = 5.2613;
  // securities.DIS = 2.2229;
  // securities.WBD = 15.1172;
  // securities['DFEA.SW'] = 80;
  // securities['ZAL.DE'] = 52.622;
  // securities['ZURN.SW'] = 2;
  // const allDividends = Object.keys(securities).map(async (key: string) => yahooFinance.getDividends(key));
  type TradeInfo = [string, number];

  securityModel.findTrades()
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
            .catch((err: Error) => reject(err));
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
        .catch((err: Error) => err);
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

securityRouter.get('/:id', async (req: Request, res: Response) => {
  const symbol = String(req.params.id);
  yahooFinance.getDividends(symbol)
    .then((dividend) => { res.status(200).json({ data: dividend }); })
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
    return yahooFinance.findOne(symbol, isin);
  });

  Promise.all(securities)
    .then((securitiesResult) => securityModel.createMultiple(securitiesResult))
    .then((message) => { res.status(200).json({ data: message }); })
    .catch((err: Error) => { res.status(500).json({ message: err }); });
});

export { securityRouter };
