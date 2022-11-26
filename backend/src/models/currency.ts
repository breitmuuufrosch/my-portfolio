import { OkPacket, RowDataPacket } from 'mysql2';
import { Currency } from '../types/currency';
import { db } from '../db';

export const create = (order: Currency, callback: Function) => {
  const queryString = 'INSERT INTO currency (symbol, description) VALUES (?, ?)';

  db.query(
    queryString,
    [order.symbol, order.description],
    (err, result) => {
      if (err) { callback(err); }

      const { insertId } = <OkPacket> result;
      callback(null, insertId);
    },
  );
};

export const findOne = (orderId: number, callback: Function) => {
  const queryString = `
      SELECT 
        c.symbol,
        c.description
      FROM currency AS c
      WHERE c.order_id=?`;

  db.query(queryString, orderId, (err, result) => {
    if (err) { callback(err); }

    const row = (<RowDataPacket> result)[0];
    const order: Currency = {
      symbol: row.symbol,
      description: row.description,
    };
    callback(null, order);
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

    const rows = <RowDataPacket[]> result;
    const orders: Currency[] = [];

    rows.forEach((row) => {
      const order: Currency = {
        symbol: row.symbol,
        description: row.description,
      };
      orders.push(order);
    });
    callback(null, orders);
  });
};

export const update = (order: Currency, callback: Function) => {
  const queryString = 'UPDATE currency SET symbol=?, description=? WHERE symbol=?';

  db.query(
    queryString,
    [order.symbol, order.symbol],
    (err, result) => {
      if (err) { callback(err); }
      callback(null);
    },
  );
};
