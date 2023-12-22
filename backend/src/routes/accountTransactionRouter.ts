import express, { Request, Response } from 'express';
import * as accountTransactionModel from '../models/accountTransaction';
import { AccountTransactionSummary, AccountTransaction } from '../types/account';
import { handleRequest } from '../utils/server';

const accountTransactionRouter = express.Router();

accountTransactionRouter.get('/', async (req: Request, res: Response) => {
  const { accountId, type } = req.query;
  const userId = Number(req.headers['x-user-id']);

  const requestPromise = accountTransactionModel.findAll({
    userId,
    accountId: Number(accountId),
    type: type ? String(type) : undefined,
  });
  handleRequest<AccountTransactionSummary[]>(res, requestPromise);
});

accountTransactionRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(req.headers['x-user-id']);

  handleRequest(res, accountTransactionModel.findOne(userId, Number(id)));
});

accountTransactionRouter.get('/account/:accountId', async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const userId = Number(req.headers['x-user-id']);
  const requestPromise = accountTransactionModel.findAll({ userId, accountId: Number(accountId) });
  handleRequest<AccountTransactionSummary[]>(res, requestPromise);
});

accountTransactionRouter.post('/multiple', async (req: Request, res: Response) => {
  const transactions = req.body as AccountTransaction[];

  handleRequest(
    res,
    Promise.all(transactions.map((item) => new Promise((resolve, reject) => {
      accountTransactionModel.doesExist(item)
        .then((exists: boolean) => {
          if (exists) {
            resolve('duplicate');
            return;
          }

          accountTransactionModel.create(item)
            .then(resolve)
            .catch(reject);
        });
    })))
  );
});

export { accountTransactionRouter };
