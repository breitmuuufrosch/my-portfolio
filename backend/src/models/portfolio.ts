import { OkPacket, RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { PorftolioQuote } from '../types/security';

export const getPortfolioHistory = (userId: number, currency: string, startDate: Date, endDate: Date): Promise<PorftolioQuote[]> => {
  startDate = startDate ?? new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  endDate = endDate ?? new Date();

  const queryString = `
    SELECT
      pf_value.currency,
      pf_value.date,
      SUM(pf_value.close) AS close,
      SUM(pf_value.value) AS value,
      SUM(pf_value.entry_price) AS entry_price
    FROM (
      SELECT
        a.user_id,
        sph.security_id,
        s_details.currency,
        sph.date,
        sph.close,
        SUM(security_summary.amount) AS amount,
        SUM(security_summary.amount) * sph.close AS value,
        -- SUM(security_summary.value) AS entry_price
        SUM(CASE WHEN security_summary.type IN ('sell','vesting') THEN -security_summary.value ELSE security_summary.value END) AS entry_price
      FROM security_price AS sph
      LEFT JOIN security AS s_details ON s_details.id = sph.security_id
      INNER JOIN security_transaction_summary AS security_summary ON
        security_summary.security_id = sph.security_id
        AND security_summary.date <= sph.date
        AND security_summary.type IN ('buy', 'sell', 'posting')
      LEFT JOIN account AS a ON a.id = security_summary.account_id
      -- WHERE sph.security_id IN (1, 10)
      GROUP BY
        a.user_id,
        sph.security_id,
        s_details.currency,
        sph.date
      ORDER BY sph.date
    ) AS pf_value
    WHERE pf_value.currency = :currency
	    AND pf_value.user_id = :userId
      AND WEEKDAY(pf_value.date) NOT IN (5, 6)
      AND pf_value.date BETWEEN :startDate AND :endDate
    GROUP BY
      pf_value.currency,
      pf_value.date
    ORDER BY pf_value.date
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ userId, currency, startDate, endDate }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const securityQuotes: PorftolioQuote[] = rows.map((row) => ({
          date: new Date(row.date),
          value: Number(row.value),
          entryPrice: Number(row.entry_price),
          close: Number(row.close),
          currency: row.currency,
        }));
        resolve(securityQuotes);
      },
    );
  });
};
