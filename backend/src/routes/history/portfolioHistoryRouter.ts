import express, { Request, Response } from 'express';
import * as securityModel from '../../models/security';
import { PorftolioQuote } from '../../types/security';

const portfolioHistoryRouter = express.Router();

portfolioHistoryRouter.get('/portfolio/:currency', async (req: Request, res: Response) => {
  const currency = String(req.params.currency);

  securityModel.getPortfolioHistory(currency)
    .then((portfolioQuotes: PorftolioQuote[]) => res.status(200).json(portfolioQuotes))
    .catch((err: Error) => {
      res.status(500).json({ message: err.message });
    });
});

export { portfolioHistoryRouter };
