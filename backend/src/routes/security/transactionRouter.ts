import express, { Request, Response } from 'express';
import * as securityModel from '../../models/security';
import * as transactionModel from '../../models/securityTransaction';
import { Security, SecurityTransaction, SecurityTransactionSummary } from '../../types/security';
import { handleRequest } from '../../utils/server';

const transactionRouter = express.Router();

transactionRouter.post('/', async (req: Request, res: Response) => {
  const transaction = req.body as SecurityTransaction;

  securityModel.findOne(transaction.symbol)
    .then((security) => transactionModel.create({ ...transaction, securityId: security.id }))
    .then((insertedIds) => { res.status(200).json({ data: insertedIds }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

transactionRouter.patch('/', async (req: Request, res: Response) => {
  console.log(req);
  const transaction = req.body as SecurityTransactionSummary;

  handleRequest(res, transactionModel.update(transaction));
});

transactionRouter.post('/multiple', async (req: Request, res: Response) => {
  const transactions = req.body as SecurityTransaction[];

  Promise.all(transactions.map((item) => new Promise((resolve, reject) => {
    securityModel.findOne(item.symbol)
      .then((security: Security) => {
        const updatedSecurity = { ...item, securityId: security.id };

        transactionModel.doesExist(updatedSecurity)
          .then((exists: boolean) => {
            if (exists) {
              resolve('duplicate');
              return;
            }

            transactionModel.create(updatedSecurity)
              .then(resolve)
              .catch(reject);
          });
      })
      .catch((err: Error) => { reject(err); });
  })))
    .then((result) => { res.status(200).json({ data: result }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

export { transactionRouter };
