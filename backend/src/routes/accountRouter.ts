import express, { Request, Response } from 'express';
import * as accountModel from '../models/account';
import * as accountTransactionModel from '../models/accountTransaction';
import { Account, AccountTransaction, AccountTransactionSummary, AccountSummary } from '../types/account';
import { handleRequest } from '../utils/server';

const accountRouter = express.Router();

accountRouter.get('/', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  handleRequest<Account[]>(res, accountModel.findAll(userId));
});

accountRouter.get('/summary', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  const requestPromise = accountModel.getSummary(userId);
  handleRequest<AccountSummary[]>(res, requestPromise);
});

export { accountRouter };
