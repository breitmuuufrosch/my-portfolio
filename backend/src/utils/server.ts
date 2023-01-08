import express, { Request, Response } from 'express';

export const handleRequest = async <T>(res: Response, promise: Promise<T>) => {
  promise
    .then((result: T) => { res.status(200).json(result); })
    .catch((err: Error) => { res.status(500).json({ message: err.message }); });
};
