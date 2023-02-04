import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { Trade } from '../types/trade';

export const findAll = (userId: number): Promise<Trade[]> => {
  const queryString = `
  SELECT
    user_id,
    name,
    symbol,
    quote_type,
    currency,
    entry_price,
    entry_price_all,
    amount,
    last_price,
    last_date,
    exit_price,
    profit_loss,
    profit_loss_percentage
  FROM trade
  WHERE trade.user_id = :userId
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ userId }),
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
          lastDate: new Date(row.last_date),
          exitPrice: Number(row.exit_price),
          profitLoss: Number(row.profit_loss),
          profitLossPercentage: Number(row.profit_loss_percentage),
        }));
        resolve(trades);
      },
    );
  });
};
