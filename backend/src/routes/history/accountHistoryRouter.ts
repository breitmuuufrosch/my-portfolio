import express, { Request, Response } from 'express';
import * as accountHistoryModel from '../../models/accountHistory';
import { AccountHistory } from '../../types/account';
import { handleRequest } from '../../utils/server';

const accountHistoryRouter = express.Router();

accountHistoryRouter.get('/', async (req: Request, res: Response) => {
  const { accountId, type } = req.query;

  const requestPromise = accountHistoryModel.find({
    accountId: Number(accountId),
    type: type ? String(type) : undefined,
   });
   handleRequest<AccountHistory[]>(res, requestPromise);
});

export { accountHistoryRouter };
