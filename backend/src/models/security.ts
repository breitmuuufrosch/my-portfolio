import { OkPacket, RowDataPacket } from 'mysql2';
import { db } from '../db';
import { Security } from '../types/security';

export const create = (order: Security, callback: Function) => {
  const queryString = 'INSERT INTO currency (symbol, description) VALUES (?, ?)';

  db.query(
    queryString,
    [order.symbol, order.longName],
    (err, result) => {
      if (err) { callback(err); }

      const { insertId } = <OkPacket> result;
      callback(null, insertId);
    },
  );
};
