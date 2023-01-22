import { RowDataPacket } from 'mysql2';
import { db } from '../db';
import { Trade } from '../types/trade';

export const findAll = (): Promise<Trade[]> => {
  const queryString = `
  SELECT
    name,
    symbol,
    quote_type,
    currency,
    entry_price,
    entry_price_all,
    amount,
    last_price,
    last_date,
    exit_price
  FROM trade
  `;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const trades: Trade[] = rows.map((row) => ({
          name: row.name,
          symbol: row.symbol,
          currency: row.currency,
          quoteType: row.quote_type,
          entryPrice: Number(row.entry_price),
          entryPriceAll: Number(row.entry_price_all),
          amount: Number(row.amount),
          lastPrice: Number(row.last_price),
          lastDate: row.last_date,
          exitPrice: Number(row.exit_price),
        }));
        resolve(trades);
      },
    );
  });
};
