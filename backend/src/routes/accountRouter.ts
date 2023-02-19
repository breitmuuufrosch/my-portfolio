import express, { Request, Response } from 'express';
import * as accountModel from '../models/account';
import * as accountHistoryModel from '../models/accountHistory';
import * as transactionModel from '../models/transaction';
import { Account, AccountTransaction, AccountTransactionSummary, AccountSummary } from '../types/account';
import { handleRequest } from '../utils/server';

const accountRouter = express.Router();

accountRouter.get('/', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  handleRequest<Account[]>(res, accountModel.findAll(userId));
});

accountRouter.get('/:accountId/histories', async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const userId = Number(req.headers['x-user-id']);
  const requestPromise = accountHistoryModel.findAll({ userId, accountId: Number(accountId) });
  handleRequest<AccountTransactionSummary[]>(res, requestPromise);
});

accountRouter.get('/summary', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  const requestPromise = accountHistoryModel.getSummary(userId);
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
