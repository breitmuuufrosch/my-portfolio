import express, { Request, Response } from 'express';
import * as accountHistoryModel from '../../models/accountHistory';
import { AccountTransaction, AccountTransactionSummary } from '../../types/account';
import { handleRequest } from '../../utils/server';

const accountHistoryRouter = express.Router();

accountHistoryRouter.get('/', async (req: Request, res: Response) => {
  const { accountId, type } = req.query;
  const userId = Number(req.headers['x-user-id']);

  const requestPromise = accountHistoryModel.findAll({
    userId,
    accountId: Number(accountId),
    type: type ? String(type) : undefined,
   });
   handleRequest<AccountTransactionSummary[]>(res, requestPromise);
});

accountHistoryRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(req.headers['x-user-id']);

  handleRequest(res, accountHistoryModel.findOne(userId, Number(id)));
});

export { accountHistoryRouter };
