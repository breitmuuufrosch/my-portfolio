import express, { Request, Response } from 'express';
import * as securityModel from '../../models/security';
import { Security, SecurityTransaction } from '../../types/security';

const transactionRouter = express.Router();

transactionRouter.post('/', async (req: Request, res: Response) => {
  const transaction = req.body as SecurityTransaction;

  securityModel.findOne(transaction.symbol)
    .then((security) => securityModel.createTransaction({ ...transaction, security_id: security.id }))
    .then((insertedIds) => { res.status(200).json({ data: insertedIds }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

transactionRouter.post('/multiple', async (req: Request, res: Response) => {
  const transactions = req.body as SecurityTransaction[];

  Promise.all(transactions.map((item) => new Promise((resolve, reject) => {
    securityModel.findOne(item.symbol)
      .then((security: Security) => {
        if (item.currency === 'CHF') {
          securityModel.createTransaction({ ...item, security_id: security.id })
            .then(resolve)
            .catch(reject);
        } else {
          securityModel.createTransactionForeign({ ...item, security_id: security.id })
            .then(resolve)
            .catch(reject);
        }
      })
      .catch((err: Error) => { reject(err); });
  })))
    .then((result) => { res.status(200).json({ data: result }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

export { transactionRouter };
