import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { SecurityHistory } from '../types/security';

export interface SecurityHistoryParams {
  securityId?: number,
  type?: string,
}

const rowToSecurityHistory = (row: RowDataPacket): SecurityHistory => ({
  id: row.id,
  symbol: row.symbol,
  nameShort: row.name_short,
  date: new Date(row.date),
  type: row.type,
  accountId: row.account_id,
  accountTransactionId: row.account_transaction_id,
  securityId: row.security_id,
  currency: row.currency,
  price: Number(row.price),
  amount: Number(row.amount),
  total: Number(row.total),
  value: Number(row.value),
  fee: Number(row.fee),
  tax: Number(row.tax),
});


export const findOne = (id: number): Promise<SecurityHistory> => {
  let queryString = `
    SELECT *
    FROM security_history AS sh
    WHERE sh.id = :id
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ id }),
      (err, result) => {
        if (err) { reject(err); return; }

        const row = (<RowDataPacket>result)[0];
        resolve(rowToSecurityHistory(row));
      },
    );
  });
};

export const findAll = (params: SecurityHistoryParams): Promise<SecurityHistory[]> => {
  let queryString = `
    SELECT *
    FROM security_history AS sh
  `;

  if (params.securityId || params.type) {
    const filters = [];

    if (params.securityId) {
      filters.push('sh.security_id = :securityId');
    }
    if (params.type) {
      filters.push('sh.type = :type');
    }
    queryString += `
    WHERE ${filters.join(' AND ')}
    `;
  }

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ ...params }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        resolve(rows.map(rowToSecurityHistory));
      },
    );
  });
};
