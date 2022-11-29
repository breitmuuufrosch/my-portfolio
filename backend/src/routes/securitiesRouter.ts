import express, { Request, Response } from 'express';
import { stringify } from 'querystring';
import * as securityModel from "../models/security";
import * as yahooFinance from '../models/yahooApi';
import { Currency } from '../types/currency';
import { Security, SecurityQuote, SecurityTransaction } from '../types/security';

const securitiesRouter = express.Router();

securitiesRouter.get('/', async (req: Request, res: Response) => {
  const securities: { [key: string]: number } = {};
  securities['ABBN.SW'] = 25;
  securities['ACLN.SW'] = 1 + 29;
  securities.ADBE = 2;
  securities.AMD = 0.265;
  securities['BEKN.SW'] = 2;
  securities['BYS.SW'] = 1;
  securities['RBOT.SW'] = 49;
  securities['INRG.SW'] = 40;
  securities['SCWS.SW'] = 950;
  securities['CSSMIM.SW'] = 1;
  securities['JFN.SW'] = 6;
  securities['LISN.SW'] = 0.0002;
  securities['LOGN.SW'] = 20;
  securities.MA = 1;
  securities['NOVN.SW'] = 6;
  securities.NVDA = 4;
  securities['OFN.SW'] = 8;
  securities['ESSN.SW'] = 330;
  securities.STX = 12 + 9;
  securities['SREN.SW'] = 11;
  securities['SCMN.SW'] = 1;
  securities['SQN.SW'] = 4;
  securities['UBI.PA'] = 5.2613;
  securities.DIS = 2.2229;
  securities.WBD = 15.1172;
  securities['DFEA.SW'] = 80;
  securities['ZAL.DE'] = 52.622;
  securities['ZURN.SW'] = 2;
  const allDividends = Object.keys(securities).map(async (key: string) => yahooFinance.getDividends(key));
  let total = 0;

  const divResult = await Promise.all(allDividends.map(async (req) => {
    const dividend: any = await req;
    try {
      dividend.total = dividend.dividendRate * securities[dividend.symbol];
      if (Number.isNaN(dividend.total) === false) {
        console.log(dividend.total);
        total += dividend.total;
      }
      return { symbol: dividend.symbol, total: dividend.total };
    } catch (e: unknown) {
      console.error(e);
    }
  }));
  console.log(divResult);
  // securities.map((value: string, key: number) => {
  //   const div = yahooFinance.getDividends(value));
  // }))
  // // orderModel.findAll((err: Error, orders: Currency[]) => {
  // //   if (err) {
  // //     return res.status(500).json({"errorMessage": err.message});
  // //   }

  // res.status(200).json({"data": {all: divResult, total}});
  res.status(200).json({ all: divResult, total });
  // // });
});

// securitiesRouter.post("/", async (req: Request, res: Response) => {
//   const newOrder: Currency = req.body;
//   orderModel.create(newOrder, (err: Error, orderId: number) => {
//     if (err) {
//       return res.status(500).json({"message": err.message});
//     }

//     res.status(200).json({"orderId": orderId});
//   });
// });

securitiesRouter.get('/:id', async (req: Request, res: Response) => {
  const symbol = String(req.params.id);
  try {
    const dividend = await yahooFinance.getDividends(symbol);

    res.status(200).json({ data: dividend });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// securitiesRouter.put("/:id", async (req: Request, res: Response) => {
//   const order: Currency = req.body;
//   orderModel.update(order, (err: Error) => {
//     if (err) {
//       return res.status(500).json({"message": err.message});
//     }

//     res.status(200).send();
//   })
// });

securitiesRouter.post('/add/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);
  const { isin } = req.body;
  const security = await yahooFinance.findOne(symbol, isin);
  console.log(security)

  securityModel.create(security, (err: Error, security: Security) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(200).json(security);
  });
});

securitiesRouter.post('/add-multiple', async (req: Request, res: Response) => {
  const securities: Security[] = req.body.map(async item => {
    console.log(item);
    const { symbol, isin } = item;
    const security = await yahooFinance.findOne(symbol, isin);

    return security;
  });

  const securitiesResult = await Promise.all(securities);

  securityModel.createMultiple(securitiesResult, (err: Error, ids: number[]) => {
    if (err) { res.status(500).json({ message: err.message, data: securitiesResult }); return; }
    res.status(200).json(ids);
  });
  // res.status(200).json(securitiesResult);
  // const security = await yahooFinance.findOne(symbol, isin);
  // console.log(security)

  // securityModel.create(security, (err: Error, security: Security) => {
  //   if (err) {
  //     return res.status(500).json({ message: err.message });
  //   }

  //   res.status(200).json(security);
  // });
});

securitiesRouter.put('/history/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);

  try {
    securityModel.findOne(symbol, async (err: Error, security: Security) => {
      console.log(err, security);
      const test = await yahooFinance.getHistory(symbol);
      const history: SecurityQuote[] = test.map(row => ({
        ...row,
        security_id: security.id,
      }));

      securityModel.update_history(history, (err: Error, id: number) => {
        if (err) { throw err; }

        res.status(200).json({ data: test });
      });
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

securitiesRouter.post('/transaction', async (req: Request, res: Response) => {
  const transaction =req.body as SecurityTransaction;

  try {
    securityModel.findOne(transaction.symbol, async (err: Error, security: Security) => {
      securityModel.createTransaction({...transaction, security_id: security.id}, (err: Error, success: number) => {
        if (err) { throw err; }
        res.status(200).json({ data: success });
      });
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
});

securitiesRouter.post('/transaction-multiple', async (req: Request, res: Response) => {
  const transactions = req.body as SecurityTransaction[];

  try {
    const result = await Promise.all(transactions.map(item => {
      return new Promise((resolve, reject) => {
        securityModel.findOne(item.symbol, async (err: Error, security: Security) => {
          if (item.currency === 'CHF') {
            securityModel.createTransaction({...item, security_id: security.id}, (err: Error, success: number) => {
              if (err) { reject(err); }
              resolve(success);
            });
          } else {
            securityModel.createTransactionForeign({...item, security_id: security.id}, (err: Error, success: number) => {
              if (err) { reject(err); }
              resolve(success);
            });
          }
        });
      });
    }));

    res.status(200).json({ data: result });
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
});

export { securitiesRouter };
