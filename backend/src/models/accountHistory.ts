import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { AccountHistory, AccountSummary } from '../types/account';

const rowToAccountHistory = (row: RowDataPacket): AccountHistory => ({
  id: row.id,
  accountId: row.account_id,
  securityId: row.security_id,
  symbol: row.symbol,
  nameShort: row.name_short,
  date: row.date,
  type: row.type,
  currency: row.currency,
  total: Number(row.total),
  value: Number(row.value),
  fee: Number(row.fee),
  tax: Number(row.tax),
});

export interface AccountHistoryParams {
  accountId?: number,
  type?: string,
}

export const find = (params: AccountHistoryParams): Promise<AccountHistory[]> => {
  let queryString = `
    SELECT *
    FROM account_history AS ah
  `;

  if (params.accountId || params.type) {
    const filters = [];

    if (params.accountId) {
      filters.push('ah.account_id = :accountId');
    }
    if (params.type) {
      filters.push('ah.type = :type');
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
        resolve(rows.map(rowToAccountHistory));
      },
    );
  });
};

export const getSummary = (): Promise<AccountSummary[]> => {
  const queryString = `
    SELECT
      a.id,
      a.name,
      a.currency,
      SUM(ah.total) AS balance
    FROM account_history AS ah
    LEFT JOIN account AS a ON a.id = ah.account_id
    GROUP BY a.id, a.name, a.currency
  `;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const accountSummary: AccountSummary[] = rows.map((row) => ({
          id: row.id,
          name: row.name,
          currency: row.currency,
          balance: row.balance,
        }));
        resolve(accountSummary);
      },
    );
  });
};
