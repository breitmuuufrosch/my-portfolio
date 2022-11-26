import express, { Request, Response } from 'express';
import * as currencyModel from '../models/currency';
import { Currency } from '../types/currency';

const currencyRouter = express.Router();

currencyRouter.get('/', async (req: Request, res: Response) => {
  currencyModel.findAll((err: Error, currencies: Currency[]) => {
    if (err) {
      return res.status(500).json({ errorMessage: err.message });
    }

    res.status(200).json({ data: currencies });
  });
});

currencyRouter.post('/', async (req: Request, res: Response) => {
  const newCurrency: Currency = req.body;
  currencyModel.create(newCurrency, (err: Error, symbol: number) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(200).json({ symbol });
  });
});

currencyRouter.get('/:symbol', async (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  currencyModel.findOne(symbol, (err: Error, currency: Currency) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(200).json({ data: currency });
  });
});

currencyRouter.put('/:symbol', async (req: Request, res: Response) => {
  const currency: Currency = req.body;
  currencyModel.update(currency, (err: Error) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(200).send();
  });
});

export { currencyRouter };
