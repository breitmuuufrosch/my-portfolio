import express, { Request, Response } from 'express';
import * as tradeModel from '../models/trade';
import { handleRequest } from '../utils/server';

const tradeRouter = express.Router();

tradeRouter.get('/', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  handleRequest(res, tradeModel.findAll(userId));
});

tradeRouter.get('/diversification', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  handleRequest(res, tradeModel.getDiversification(userId));
});

export { tradeRouter };
