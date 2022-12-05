import { RowDataPacket } from 'mysql2';
import { db } from '../db';
import { AccountSummary } from '../types/account';

export const findAll = (): Promise<AccountSummary[]> => {
  const queryString = `
    SELECT a.id, a.name, a.currency, SUM(ah.value) AS balance
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
