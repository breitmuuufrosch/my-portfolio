import { RowDataPacket } from 'mysql2';
import { db } from '../db';
import { Account, AccountHistory, AccountSummary } from '../types/account';

export const findAll = (): Promise<Account[]> => {
  const queryString = `
    SELECT
      a.id,
      a.name,
      a.currency,
      a.depot_id
    FROM account AS a
  `;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
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