import express, { Request, Response } from 'express';
import * as securityHistoryModel from '../../models/securityHistory';
import { handleRequest } from '../../utils/server';

const portfolioHistoryRouter = express.Router();

portfolioHistoryRouter.get('/:currency', async (req: Request, res: Response) => {
  const currency = String(req.params.currency);
  const startDate = new Date(String(req.query.start));
  const endDate = new Date(String(req.query.end));
  const userId = Number(req.headers['x-user-id']);

  handleRequest(res, securityHistoryModel.getPortfolioHistory(userId, currency, startDate, endDate));
});

export { portfolioHistoryRouter };
