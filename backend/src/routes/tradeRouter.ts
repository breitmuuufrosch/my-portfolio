import express, { Request, Response } from 'express';
import * as tradeModel from '../models/trade';
import { Trade } from '../types/trade';

const tradeRouter = express.Router();

tradeRouter.get('/', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  tradeModel.findAll(userId)
    .then((trades: Trade[]) => {
      res.status(200).json(trades);
    })
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

export { tradeRouter };
