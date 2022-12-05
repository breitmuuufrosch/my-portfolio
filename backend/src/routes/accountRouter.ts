import express, { Request, Response } from 'express';
import * as accountModel from '../models/account';
import { AccountSummary } from '../types/account';

const accountRouter = express.Router();

accountRouter.get('/', async (req: Request, res: Response) => {
  accountModel.findAll()
    .then((trades: AccountSummary[]) => {
      res.status(200).json(trades);
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

export { accountRouter };
