import { RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { Trade, TradeDiversification } from '../types/trade';

export const findAll = (userId: number): Promise<Trade[]> => {
  const queryString = `
  SELECT
    user_id,
    account_id,
    depot_id,
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
          accountId: row.account_id,
          depotId: row.depot_id,
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

export const getDiversification = (userId: number): Promise<TradeDiversification[]> => {
  const queryString = `
  SELECT *
  FROM (
    SELECT
      t.user_id,
      CONCAT(a.name, ' (', a.currency, ')') AS account_name,
      d.name AS depot_name,
      s.id,
      s.symbol,
      s.name_short,
      s.quote_type,
      CASE WHEN s.quote_type = 'CRYPTOCURRENCY' THEN 'Crypto' ELSE s.info->>'$.assetProfile.sector' END AS sector,
      CASE WHEN s.quote_type = 'CRYPTOCURRENCY' THEN 'Crypto' ELSE s.info->>'$.assetProfile.industry' END AS industry,
      -- s.info->>'$.assetProfile.sector' AS sector,
      -- s.info->>'$.assetProfile.industry' AS industry,
      t.exit_price,
      t.currency
    FROM security AS s
    LEFT JOIN trade AS t ON t.id = s.id AND t.amount > 0
    LEFT JOIN account AS a ON a.id = t.account_id
    LEFT JOIN depot AS d ON d.id = a.depot_id
      
    UNION
    
    SELECT
      b.user_id,
      CONCAT(b.name, ' (', b.currency, ')') AS account_name,
      d.name AS depot_name,
      b.id,
      b.name AS symbol,
      b.name AS name_short,
      'CASH' AS quote_type,
      NULL AS sector,
      NULL AS industry,
      b.balance AS exit_price,
      b.currency
    FROM balance AS b
    LEFT JOIN account AS a ON a.id = b.id
    LEFT JOIN depot AS d ON d.id = a.depot_id
    WHERE b.balance > 0
  ) AS w
  WHERE
    w.user_id = :userId
    AND exit_price > 0
  `;

  const getRealEstate = (trade: any): string => {
    if (trade.quote_type === 'CASH') {
      if (['yuh (house)', 'yuh (bike)'].includes(trade.symbol)) {
        return 'CASH';
      }
      if (trade.symbol === 'Initial payment (house)') {
        return 'INITIAL PAYMENT';
      }
      if (trade.symbol === 'ubs') {
        return 'CASH';
      }
    }
    if (['0P00000M6D.SW', '0P00000UYE.SW', '0P00005VLQ.SW'].includes(trade.symbol)) {
      return 'PENSION FUND';
    }
    if (['0P00000OS7.SW', '0P00000OS8.SW', '0P00000OS9.SW'].includes(trade.symbol)) {
      return 'FUNDS';
    }
    return null;
  }

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ userId }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const trades: TradeDiversification[] = rows.map((row) => ({
          id: row.id,
          name: row.name_short,
          symbol: row.symbol,
          quoteType: row.quote_type,
          sector: row.sector,
          industry: row.industry,
          exitPrice: Number(row.exit_price),
          currency: row.currency,
          realEstate: getRealEstate(row),
          account: row.account_name,
          depot: row.depot_name,
        }));
        resolve(trades);
      },
    );
  });
};
