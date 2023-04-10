import express, { Request, Response } from 'express';
import * as securityModel from '../../models/security';
import { PorftolioQuote } from '../../types/security';

const portfolioHistoryRouter = express.Router();

portfolioHistoryRouter.get('/:currency', async (req: Request, res: Response) => {
  const currency = String(req.params.currency);
  const startDate = new Date(String(req.query.start));
  const endDate = new Date(String(req.query.end));
  const userId = Number(req.headers['x-user-id']);

  securityModel.getPortfolioHistory(userId, currency, startDate, endDate)
    .then((portfolioQuotes: PorftolioQuote[]) => res.status(200).json(portfolioQuotes))
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

export { portfolioHistoryRouter };
