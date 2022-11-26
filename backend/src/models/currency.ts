import { OkPacket, RowDataPacket } from 'mysql2';
import { Currency } from '../types/currency';
import { db } from '../db';
import { mysql as sql } from 'yesql';

export const create = (currency: Currency, callback: Function) => {
  const queryString = sql(
    'INSERT INTO currency (symbol, description) VALUES (?, ?)'
  );

  db.query(
    queryString({symbol: currency.symbol, description: currency.description}),
    (err, result) => {
      if (err) { callback(err); }

      const { insertId } = <OkPacket>result;
      callback(null, insertId);
    },
  );
};

export const findOne = (symbol: string, callback: Function) => {
  const queryString = sql(
    `SELECT 
        c.symbol,
        c.description
      FROM currency AS c
      WHERE c.symbol=:symbol`
  );

  db.query(queryString({ symbol: symbol }), (err, result) => {
    if (err) { callback(err); }

    const row = (<RowDataPacket>result)[0];
    const currency: Currency = {
      symbol: row.symbol,
      description: row.description,
    };
    callback(null, currency);
  });
};

export const findAll = (callback: Function) => {
  const queryString = `
    SELECT 
      c.symbol,
      c.description
    FROM currency AS c`;

  db.query(queryString, (err, result) => {
    if (err) { callback(err); }

    const rows = <RowDataPacket[]>result;
    const currencies: Currency[] = [];

    rows.forEach((row) => {
      const currency: Currency = {
        symbol: row.symbol,
        description: row.description,
      };
      currencies.push(currency);
    });
    callback(null, currencies);
  });
};

export const update = (currency: Currency, callback: Function) => {
  const queryString = sql(
    'UPDATE currency SET symbol=:symbol, description=:description WHERE symbol=:symbol'
  );

  db.query(
    queryString({symbol: currency.symbol, description: currency.description}),
    (err, result) => {
      if (err) { callback(err); }
      callback(null);
    },
  );
};
