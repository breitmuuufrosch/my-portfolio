import express from 'express';
import { accountHistoryRouter } from './history/accountHistoryRouter';
import { portfolioHistoryRouter } from './history/portfolioHistoryRouter';
import { priceHistoryRouter } from './history/priceHistoryRouter';
import { securityHistoryRouter } from './history/securityHistoryRouter';

const historyRouter = express.Router();

historyRouter.use('/prices', priceHistoryRouter);
historyRouter.use('/accounts', accountHistoryRouter);
historyRouter.use('/securities', securityHistoryRouter);
historyRouter.use('/portfolios', portfolioHistoryRouter);

export { historyRouter };
