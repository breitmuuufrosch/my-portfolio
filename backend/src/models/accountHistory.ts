import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { AccountTransaction, AccountTransactionSummary, AccountSummary } from '../types/account';

const rowToAccountTransactionSummary = (row: RowDataPacket): AccountTransactionSummary => ({
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
  fromAccountId: row.from_account_id,
  fromCurrency: row.from_currency,
  fromValue: Number(row.from_value),
  fromFee: Number(row.from_fee),
  fromTax: Number(row.from_tax),
  toAccountId: row.to_account_id,
  toCurrency: row.to_currency,
  toValue: Number(row.to_value),
  toFee: Number(row.to_fee),
  toTax: Number(row.to_tax),
});

export interface AccountHistoryParams {
  userId: number,
  accountId?: number,
  type?: string,
}

export const findOne = (userId: number, id: number): Promise<AccountTransaction> => {
  let queryString = `
    SELECT *
    FROM account_transaction_detailed AS atd
    WHERE
      atd.user_id = :userId
      AND atd.id = :id
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ userId, id }),
      (err, result) => {
        if (err) { reject(err); return; }

        const row = (<RowDataPacket>result)[0];
        resolve(rowToAccountTransaction(row));
      },
    );
  });
};


export const findAll = (params: AccountHistoryParams): Promise<AccountTransactionSummary[]> => {
  let queryString = `
    SELECT *
    FROM account_transaction_summary AS ats
  `;

  const filters = ['ats.user_id = :userId'];
  if (params.accountId) {
    filters.push('ats.account_id = :accountId');
  }
  if (params.type) {
    filters.push('ats.type = :type');
  }
  queryString += `
  WHERE ${filters.join(' AND ')}
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ ...params }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        resolve(rows.map(rowToAccountTransactionSummary));
      },
    );
  });
};

export const getSummary = (userId: number): Promise<AccountSummary[]> => {
  const queryString = sql(`
    SELECT
      a.id,
      a.name,
      a.currency,
      SUM(ats.total) AS balance
    FROM account_transaction_summary AS ats
    LEFT JOIN account AS a ON a.id = ats.account_id
    WHERE a.user_id = :userId
    GROUP BY a.id, a.name, a.currency
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ userId }),
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
