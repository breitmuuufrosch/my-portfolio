import { OkPacket, RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { Security, SecurityQuote, SecurityTransaction } from '../types/security';
import { Trade } from '../types/trade';

export const findOne = (symbol: string): Promise<Security> => {
  const queryString = sql(`
    SELECT
      s.id,
      s.symbol,
      s.currency,
      s.quote_type,
      s.isin,
      s.valor,
      s.name_short,
      s.name_long,
      s.info
    FROM security AS s
    WHERE s.symbol=:symbol
  `);
  const sqlQuery = queryString({ symbol });

  return new Promise((resolve, reject) => {
    db.query(
      sqlQuery,
      (err, result) => {
        try {
          if (err) { reject(err); return; }

          const row = (<RowDataPacket>result)[0];
          const security: Security = {
            id: row.id,
            symbol: row.symbol,
            currency: row.currency,
            quoteType: row.quote_type,
            isin: row.isin,
            valor: row.valor,
            nameShort: row.name_short,
            nameLong: row.name_long,
            info: row.info,
          };
          resolve(security);
        } catch (err: any) {
          reject(`${symbol}: ${err}`);
        }
      }
    );
  });
};

export const findAll = (): Promise<Security[]> => {
  const queryString = `
    SELECT
      s.id,
      s.symbol,
      s.currency,
      s.quote_type,
      s.isin,
      s.valor,
      s.name_short,
      s.name_long,
      s.info,
      t.number
    FROM security AS s
    LEFT JOIN trade AS t ON t.id = s.id
  `;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const security: Security[] = rows.map((row) => ({
          id: row.id,
          symbol: row.symbol,
          currency: row.currency,
          quoteType: row.quote_type,
          isin: row.isin,
          valor: row.valor,
          nameShort: row.name_short,
          nameLong: row.name_long,
          info: row.info,
          holdings: row.number,
        }));
        resolve(security);
      }
    );
  });
};

export const create = (security: Security): Promise<number> => {
  const queryString = sql(`
    INSERT INTO security (symbol, currency, quote_type, isin, valor, name_short, name_long, info)
    VALUES (:symbol, :currency, :quoteType, :isin, :valor, :nameShort, :nameLong, :info)
    ON DUPLICATE KEY UPDATE isin=:isin, valor=:valor, info=:info
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ ...security, valor: undefined, info: JSON.stringify(security.info) }),
      (err, result) => {
        if (err) { reject(err); return; }

        const { insertId } = <OkPacket>result;
        resolve(insertId);
      },
    );
  });
};

export const createMultiple = (securities: Security[]): Promise<string> => {
  const queryString = `
    INSERT INTO security (symbol, currency, quote_type, isin, valor, name_short, name_long, info)
    VALUES ?
    ON DUPLICATE KEY UPDATE isin=VALUES(isin), valor=VALUES(valor), info=VALUES(info)
  `;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
      [
        securities.map((item) => [
          item.symbol,
          item.currency,
          item.quoteType,
          item.isin,
          item.valor,
          item.nameShort,
          item.nameLong, JSON.stringify(item.info),
        ]),
      ],
      (err, result) => {
        if (err) { reject(err); return; }

        resolve(`inserted-rows ${(<OkPacket>result).affectedRows}`);
      },
    );
  });
};

export const updateHistory = (history: SecurityQuote[]): Promise<string> => {
  const queryString = `
    INSERT INTO security_history (security_id, date, high, low, open, close, adjclose, volume)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      high=VALUES(high),
      low=VALUES(low),
      open=VALUES(open),
      close=VALUES(close),
      adjclose=VALUES(adjclose),
      volume=VALUES(volume)
  `;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
      [
        history.map((item) => [
          item.security_id,
          item.date,
          item.high,
          item.low,
          item.open,
          item.close,
          item.adjClose,
          item.volume,
        ]),
      ],
      (err, result) => {
        if (err) { reject(err); return; }

        resolve(`inserted-rows ${(<OkPacket>result).affectedRows}`);
      },
    );
  });
};
