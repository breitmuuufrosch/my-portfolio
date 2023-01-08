import express, { Request, Response } from 'express';
import * as securityHistoryModel from '../../models/securityHistory';
import { AccountHistory } from '../../types/account';

const securityHistoryRouter = express.Router();

securityHistoryRouter.get('/', async (req: Request, res: Response) => {
  const { securityId, type } = req.query;

  securityHistoryModel.findAll({ securityId: Number(securityId), type: type ? String(type) : undefined })
    .then((currencies: AccountHistory[]) => { res.status(200).json(currencies); })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

securityHistoryRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  securityHistoryModel.findOne(Number(id))
    .then((currencies: AccountHistory) => { res.status(200).json(currencies); })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

export { securityHistoryRouter };
