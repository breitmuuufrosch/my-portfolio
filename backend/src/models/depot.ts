import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { Depot } from '../types/account';

export const findAll = (userId): Promise<Depot[]> => {
  const queryString = `
    SELECT
      d.id,
      d.name,
      a.user_id
    FROM depot AS d
    JOIN account AS a ON a.depot_id = d.id
    WHERE a.user_id = :userId
    GROUP BY d.id, d.name, a.user_id
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ userId }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const depots: Depot[] = rows.map((row) => ({
          id: row.id,
          name: row.name,
        }));
        resolve(depots);
      },
    );
  });
};