import express, { Request, Response } from 'express';
import * as securityModel from '../models/security';
import * as securityTransactionModel from '../models/securityTransaction';
import { Security, SecurityTransaction, SecurityTransactionSummary } from '../types/security';
import { handleRequest } from '../utils/server';

const securityTransactionRouter = express.Router();

securityTransactionRouter.get('/', async (req: Request, res: Response) => {
  const { securityId, type } = req.query;
  const userId = Number(req.headers['x-user-id']);

  securityTransactionModel.findAll({ userId, securityId: Number(securityId), type: type ? String(type) : undefined })
    .then((currencies: SecurityTransactionSummary[]) => { res.status(200).json(currencies); })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

securityTransactionRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(req.headers['x-user-id']);
  console.log(userId);

  securityTransactionModel.findOne(userId, Number(id))
    .then((currencies: SecurityTransactionSummary) => { res.status(200).json(currencies); })
    .catch((err: Error) => { res.status(500).json({ errorMessage: err.message }); });
});

securityTransactionRouter.post('/', async (req: Request, res: Response) => {
  const transaction = req.body as SecurityTransaction;

  securityModel.findOne(transaction.symbol)
    .then((security) => securityTransactionModel.create({ ...transaction, securityId: security.id }))
    .then((insertedIds) => { res.status(200).json({ data: insertedIds }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

securityTransactionRouter.patch('/:id', async (req: Request, res: Response) => {
  console.log(req);
  const transaction = req.body as SecurityTransactionSummary;

  handleRequest(res, securityTransactionModel.update(transaction));
});

securityTransactionRouter.post('/multiple', async (req: Request, res: Response) => {
  const transactions = req.body as SecurityTransaction[];

  Promise.all(transactions.map((item) => new Promise((resolve, reject) => {
    securityModel.findOne(item.symbol)
      .then((security: Security) => {
        const updatedSecurity = { ...item, securityId: security.id };

        securityTransactionModel.doesExist(updatedSecurity)
          .then((exists: boolean) => {
            if (exists) {
              resolve('duplicate');
              return;
            }

            securityTransactionModel.create(updatedSecurity)
              .then(resolve)
              .catch(reject);
          });
      })
      .catch((err: Error) => { reject(err); });
  })))
    .then((result) => { res.status(200).json({ data: result }); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
});

export { securityTransactionRouter };
