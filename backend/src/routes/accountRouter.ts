import express, { Request, Response } from 'express';
import * as accountModel from '../models/account';
import * as accountHistoryModel from '../models/accountHistory';
import * as transactionModel from '../models/transaction';
import { Account, AccountHistory, AccountSummary } from '../types/account';
import { AccountTransaction } from '../types/security';
import { handleRequest } from '../utils/server';

const accountRouter = express.Router();

accountRouter.get('/', async (req: Request, res: Response) => {
  handleRequest<Account[]>(res, accountModel.findAll());
});

accountRouter.get('/:accountId/histories', async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const requestPromise = accountHistoryModel.find({ accountId: Number(accountId) });
  handleRequest<AccountHistory[]>(res, requestPromise);
});

accountRouter.get('/summary', async (req: Request, res: Response) => {
  const requestPromise = accountHistoryModel.getSummary();
  handleRequest<AccountSummary[]>(res, requestPromise);
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
      });
  })))
    .then((result) => { res.status(200).json({ data: result }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

export { accountRouter };
