import express, { Request, Response } from 'express';
import * as accountModel from '../models/account';
import * as securityModel from '../models/security';
import * as transactionModel from '../models/transaction';
import { AccountHistory, AccountSummary } from '../types/account';
import { AccountTransaction } from '../types/security';

const accountRouter = express.Router();

accountRouter.get('/history/:accountId', async (req: Request, res: Response) => {
  const { accountId } = req.params;
  accountModel.find(Number(accountId))
    .then((trades: AccountHistory[]) => {
      res.status(200).json(trades);
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

accountRouter.get('/summary', async (req: Request, res: Response) => {
  accountModel.getSummary()
    .then((trades: AccountSummary[]) => {
      res.status(200).json(trades);
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

accountRouter.post('/multiple', async (req: Request, res: Response) => {
  const transactions = req.body as AccountTransaction[];

  Promise.all(transactions.map((item) => new Promise((resolve, reject) => {

    transactionModel.doesExistAccountTransaction(item)
      .then((exists: boolean) => {
        if (exists) {
          resolve('duplicate');
          return;
        }

        transactionModel.createAccountTransaction(item)
          .then(resolve)
          .catch(reject);
      })
  })))
    .then((result) => { res.status(200).json({ data: result }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

export { accountRouter };
