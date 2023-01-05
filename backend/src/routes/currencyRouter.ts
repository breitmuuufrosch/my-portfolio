import express, { Request, Response } from 'express';
import * as currencyModel from '../models/currency';
import { Currency } from '../types/currency';

const currencyRouter = express.Router();

currencyRouter.get('/', async (req: Request, res: Response) => {
  currencyModel.findAll()
    .then((currencies: Currency[]) => { res.status(200).json({ data: currencies }); })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

currencyRouter.post('/', async (req: Request, res: Response) => {
  const newCurrency: Currency = req.body;
  currencyModel.create(newCurrency)
    .then((symbol: number) => { res.status(200).json({ symbol }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

currencyRouter.get('/:symbol', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  currencyModel.findOne(symbol)
    .then((currency: Currency) => { res.status(200).json({ data: currency }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

currencyRouter.put('/:symbol', async (req: Request, res: Response) => {
  const currency: Currency = req.body;
  currencyModel.update(currency)
    .then(() => { res.status(200).send(); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

export { currencyRouter };
