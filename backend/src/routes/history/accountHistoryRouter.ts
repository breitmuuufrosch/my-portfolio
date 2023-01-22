import express, { Request, Response } from 'express';
import * as accountHistoryModel from '../../models/accountHistory';
import { AccountHistory } from '../../types/account';
import { AccountTransaction } from '../../types/security';
import { handleRequest } from '../../utils/server';

const accountHistoryRouter = express.Router();

accountHistoryRouter.get('/', async (req: Request, res: Response) => {
  const { accountId, type } = req.query;

  const requestPromise = accountHistoryModel.findAll({
    accountId: Number(accountId),
    type: type ? String(type) : undefined,
   });
   handleRequest<AccountHistory[]>(res, requestPromise);
});

accountHistoryRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  handleRequest(res, accountHistoryModel.findOne(Number(id)));
});

export { accountHistoryRouter };
