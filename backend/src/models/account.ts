import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { Account, AccountSummary } from '../types/account';

export const findAll = (userId: number): Promise<Account[]> => {
  const queryString = `
    SELECT
      a.id,
      a.name,
      a.currency,
      a.depot_id
    FROM account AS a
    WHERE a.user_id = :userId
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ userId }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const accounts: Account[] = rows.map((row) => ({
          id: row.id,
          name: row.name,
          currency: row.currency,
          depotId: row.depot_id,
        }));
        resolve(accounts);
      },
    );
  });
};

export const getSummary = (userId: number): Promise<AccountSummary[]> => {
  const queryString = sql(`
    SELECT
      b.id,
      b.name,
      b.currency,
      b.balance
    FROM balance AS b
    WHERE b.user_id = :userId
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
