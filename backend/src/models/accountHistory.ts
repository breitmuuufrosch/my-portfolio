import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { AccountHistory, AccountSummary } from '../types/account';
import { AccountTransaction } from '../types/security';

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

const rowToAccountTransaction = (row: RowDataPacket): AccountTransaction => ({
  date: row.date,
  type: row.type,
  from_account_id: row.from_account_id,
  from_currency: row.from_currency,
  from_value: Number(row.from_value),
  from_fee: Number(row.from_fee),
  from_tax: Number(row.from_tax),
  to_account_id: row.to_account_id,
  to_currency: row.to_currency,
  to_value: Number(row.to_value),
  to_fee: Number(row.to_fee),
  to_tax: Number(row.to_tax),
});

export interface AccountHistoryParams {
  accountId?: number,
  type?: string,
}

export const findOne = (id: number): Promise<AccountTransaction> => {
  let queryString = `
    SELECT *
    FROM account_transaction_detailed AS atd
    WHERE atd.id = :id
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ id }),
      (err, result) => {
        if (err) { reject(err); return; }

        const row = (<RowDataPacket>result)[0];
        resolve(rowToAccountTransaction(row));
      },
    );
  });
};


export const findAll = (params: AccountHistoryParams): Promise<AccountHistory[]> => {
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
          balance: Number(row.balance),
        }));
        resolve(accountSummary);
      },
    );
  });
};
