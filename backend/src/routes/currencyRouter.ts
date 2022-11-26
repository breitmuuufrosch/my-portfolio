import express, { Request, Response } from 'express';
import * as orderModel from '../models/currency';
import { Currency } from '../types/currency';

const orderRouter = express.Router();

orderRouter.get('/', async (req: Request, res: Response) => {
  orderModel.findAll((err: Error, orders: Currency[]) => {
    if (err) {
      return res.status(500).json({ errorMessage: err.message });
    }

    res.status(200).json({ data: orders });
  });
});

orderRouter.post('/', async (req: Request, res: Response) => {
  const newOrder: Currency = req.body;
  orderModel.create(newOrder, (err: Error, orderId: number) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(200).json({ orderId });
  });
});

orderRouter.get('/:id', async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  orderModel.findOne(orderId, (err: Error, order: Currency) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(200).json({ data: order });
  });
});

orderRouter.put('/:id', async (req: Request, res: Response) => {
  const order: Currency = req.body;
  orderModel.update(order, (err: Error) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(200).send();
  });
});

export { orderRouter };
