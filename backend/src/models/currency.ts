import { OkPacket, RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { Currency } from '../types/currency';
import { db } from '../db';

export const create = (currency: Currency) => {
  const queryString = sql(
    'INSERT INTO currency (symbol, description) VALUES (?, ?)',
  );

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ symbol: currency.symbol, description: currency.description }),
      (err, result) => {
        if (err) { reject(err); return; }

        const { insertId } = <OkPacket>result;
        resolve(insertId);
      },
    );
  });
};

export const findOne = (symbol: string) => {
  const queryString = sql(`
    SELECT 
      c.symbol,
      c.description
    FROM currency AS c
    WHERE c.symbol=:symbol
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ symbol }),
      (err, result) => {
        if (err) { reject(err); return; }

        const row = (<RowDataPacket>result)[0];
        const currency: Currency = {
          symbol: row.symbol,
          description: row.description,
        };
        resolve(currency);
      },
    );
  });
};

export const findAll = () => {
  const queryString = `
    SELECT 
      c.symbol,
      c.description
    FROM currency AS c`;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const currencies: Currency[] = rows.map((row) => ({
          symbol: row.symbol,
          description: row.description,
        }));
        resolve(currencies);
      },
    );
  });
};

export const update = (currency: Currency) => {
  const queryString = sql(
    'UPDATE currency SET symbol=:symbol, description=:description WHERE symbol=:symbol',
  );

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ symbol: currency.symbol, description: currency.description }),
      (err, result) => {
        if (err) { reject(err); return; }
        resolve(result);
      },
    );
  });
};
