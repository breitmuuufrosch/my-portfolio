import { OkPacket, RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { PorftolioQuote, Security, SecurityQuote, SecurityTransaction } from '../types/security';
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
      s.info,
      s.source,
      s.source_url
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
            source: row.source,
            sourceUrl: row.source_url,
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
      s.source,
      s.source_url,
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
          source: row.source,
          source_url: row.source_url,
          holdings: row.number,
        }));
        resolve(security);
      }
    );
  });
};

export const create = (security: Security): Promise<number> => {
  const queryString = sql(`
    INSERT INTO security (symbol, currency, quote_type, isin, valor, name_short, name_long, info, source, source_url)
    VALUES (:symbol, :currency, :quoteType, :isin, :valor, :nameShort, :nameLong, :info, :source, :source_url)
    ON DUPLICATE KEY UPDATE isin=:isin, valor=:valor, info=:info, source=:source, source_url=:source_url
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
    INSERT INTO security (symbol, currency, quote_type, isin, valor, name_short, name_long, info, source, source_url)
    VALUES ?
    ON DUPLICATE KEY UPDATE isin=VALUES(isin), valor=VALUES(valor), name_short=VALUES(name_short), name_long=VALUES(name_long), info=VALUES(info), source=VALUES(source), source_url=VALUES(source_url)
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
          item.nameLong,
          JSON.stringify(item.info),
          item.source,
          item?.sourceUrl,
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

export const getHistory = (security_id: number): Promise<SecurityQuote[]> => {
  const queryString = sql(`
    SELECT
      sh.security_id,
      sh.date,
      sh.high,
      sh.low,
      sh.open,
      sh.close,
      sh.adjclose,
      sh.volume
    FROM security_history as sh
    WHERE
      sh.security_id = :security_id
      AND sh.date > '2022-01-01'
    ORDER BY
      sh.date
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ security_id }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const securityQuotes: SecurityQuote[] = rows.map((row) => ({
          symbol: row.symbol,
          security_id: row.security_id,
          date: row.date,
          high: row.high,
          low: row.low,
          open: row.open,
          close: row.close,
          adjClose: row.adjclose,
          volume: row.volume,
        }));
        resolve(securityQuotes);
      },
    );
  })
}

export const getPortfolioHistory = (currency: string): Promise<PorftolioQuote[]> => {
  const queryString = sql(`
    SELECT pf_value.currency, pf_value.date, SUM(pf_value.value) AS value
    FROM (
      SELECT sh.security_id, s_details.currency, sh.date, SUM(security_summary.amount) AS amount, SUM(security_summary.amount) * sh.close AS value
      FROM security_history AS sh
      LEFT JOIN security AS s_details ON s_details.id = sh.security_id
      INNER JOIN security_transaction_summary AS security_summary ON security_summary.security_id = sh.security_id AND security_summary.date <= sh.date
      -- WHERE sh.security_id IN (1, 10)
      GROUP BY sh.security_id, s_details.currency, sh.date
      ORDER BY sh.date
    ) AS pf_value
    WHERE pf_value.currency = :currency
      AND WEEKDAY(pf_value.date) NOT IN (5, 6)
    GROUP BY pf_value.currency, pf_value.date
    ORDER BY pf_value.date
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ currency }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const securityQuotes: PorftolioQuote[] = rows.map((row) => ({
          date: row.date,
          value: row.value,
          currency: row.currency,
        }));
        console.log(securityQuotes);
        resolve(securityQuotes);
      },
    );
  })
} 
