import express, { Request, Response } from 'express';
import * as currencyModel from '../models/currency';
import { Currency } from '../types/currency';
import { handleRequest } from '../utils/server';

const currencyRouter = express.Router();

currencyRouter.get('/', async (req: Request, res: Response) => {
  handleRequest<Currency[]>(res, currencyModel.findAll());
});

currencyRouter.post('/', async (req: Request, res: Response) => {
  const newCurrency: Currency = req.body;
  handleRequest<number>(res, currencyModel.create(newCurrency));
});

currencyRouter.get('/:symbol', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  handleRequest<Currency>(res, currencyModel.findOne(symbol));
});

currencyRouter.put('/:symbol', async (req: Request, res: Response) => {
  const currency: Currency = req.body;
  handleRequest<Boolean>(res, currencyModel.update(currency));
});

export { currencyRouter };
