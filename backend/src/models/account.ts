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
      b.balance,
      CASE WHEN b.currency = 'CHF' THEN b.balance
      ELSE
      b.balance * (
        SELECT 
          fp.close
        FROM forex_price AS fp
        WHERE
          fp.currency_from = b.currency
          AND fp.currency_to = 'CHF'
        ORDER BY fp.date DESC
        LIMIT 1
      )
      END AS balance_default,
      'CHF' AS currency_default
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
          currencyDefault: row.currency_default,
          balanceDefault: Number(row.balance_default),
        }));
        resolve(accountSummary);
      },
    );
  });
};
