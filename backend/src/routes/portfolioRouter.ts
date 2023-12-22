import express, { Request, Response } from 'express';
import * as portfolioModel from '../models/portfolio';
import { handleRequest } from '../utils/server';

const portfolioRouter = express.Router();

portfolioRouter.get('/history/:currency', async (req: Request, res: Response) => {
  const currency = String(req.params.currency);
  const startDate = new Date(String(req.query.start));
  const endDate = new Date(String(req.query.end));
  const userId = Number(req.headers['x-user-id']);

  handleRequest(res, portfolioModel.getPortfolioHistory(userId, currency, startDate, endDate));
});

export { portfolioRouter };
