import express, { Request, Response } from 'express';
import * as depotModel from '../models/depot';
import { Depot } from '../types/account';
import { handleRequest } from '../utils/server';

const depotRouter = express.Router();

depotRouter.get('/', async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']);
  handleRequest<Depot[]>(res, depotModel.findAll(userId));
});

export { depotRouter };
