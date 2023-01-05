import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { AccountHistory, AccountSummary } from '../types/account';

export const find = (accountId: number): Promise<AccountHistory[]> => {
  const queryString = sql(`
    SELECT
      ah.id,
      ah.type,
      ah.account_id,
      ah.security_id,
      ah.date,
      ah.currency,
      ah.total,
      ah.value,
      ah.fee,
      ah.tax,
      ah.symbol,
      ah.name_short
    FROM account_history AS ah
    WHERE
      ah.account_id = :accountId
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ accountId }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const accountHistory: AccountHistory[] = rows.map((row) => ({
          id: row.id,
          type: row.type,
          accountId: row.account_id,
          securityId: row.security_id,
          symbol: row.symbol,
          nameShort: row.name_short,
          date: new Date(row.date),
          currency: row.currency,
          total: Number(row.total),
          value: Number(row.value),
          fee: Number(row.fee),
          tax: Number(row.tax),
        }));
        resolve(accountHistory);
      },
    );
  });
};


export const getSummary = (): Promise<AccountSummary[]> => {
  const queryString = `
    SELECT a.id, a.name, a.currency, SUM(ah.total) AS balance
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
