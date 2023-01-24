import { OkPacket, RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { PorftolioQuote, Security, SecurityQuote } from '../types/security';

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
        } catch (error: unknown) {
          reject(new Error(`${symbol}: ${error}`));
        }
      },
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
      t.amount
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
      },
    );
  });
};

export const create = (security: Security): Promise<number> => {
  const queryString = sql(`
    INSERT INTO security (
      symbol,
      currency,
      quote_type,
      isin,
      valor,
      name_short,
      name_long,
      info,
      source,
      source_url
    )
    VALUES (
      :symbol,
      :currency,
      :quoteType,
      :isin,
      :valor,
      :nameShort,
      :nameLong,
      :info,
      :source,
      :source_url
    )
    ON DUPLICATE KEY UPDATE
      isin=:isin,
      valor=:valor,
      info=:info,
      source=:source,
      source_url=:source_url
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
    INSERT INTO security (
      symbol,
      currency,
      quote_type,
      isin,
      valor,
      name_short,
      name_long,
      info,
      source,
      source_url
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      isin=VALUES(isin),
      valor=VALUES(valor),
      name_short=VALUES(name_short),
      name_long=VALUES(name_long),
      info=VALUES(info),
      source=VALUES(source),
      source_url=VALUES(source_url)
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
    INSERT INTO security_price_history (
      security_id,
      date,
      high,
      low,
      open,
      close,
      adjclose,
      volume
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      high=VALUES(high),
      low=VALUES(low),
      open=VALUES(open),
      close=VALUES(close),
      adjclose=VALUES(adjclose),
      volume=VALUES(volume)
  `;

  // console.log(queryString);

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

export const getHistory = (securityId: number, startDate?: Date, endDate?: Date): Promise<SecurityQuote[]> => {
  startDate = startDate ?? new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  endDate = endDate ?? new Date();

  const queryString = sql(`
    SELECT
      sph.security_id,
      sph.date,
      sph.high,
      sph.low,
      sph.open,
      sph.close,
      sph.adjclose,
      sph.volume
    FROM security_price_history as sph
    WHERE
      sph.security_id = :securityId
      AND sph.date BETWEEN :startDate AND :endDate
    ORDER BY
      sph.date
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ securityId, startDate, endDate }),
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
  });
};

export const getPortfolioHistory = (currency: string, startDate: Date, endDate: Date): Promise<PorftolioQuote[]> => {
  startDate = startDate ?? new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  endDate = endDate ?? new Date();

  const queryString = sql(`
    SELECT
      pf_value.currency,
      pf_value.date,
      SUM(pf_value.value) AS value
    FROM (
      SELECT
        sph.security_id,
        s_details.currency,
        sph.date,
        SUM(security_summary.amount) AS amount,
        SUM(security_summary.amount) * sph.close AS value
      FROM security_price_history AS sph
      LEFT JOIN security AS s_details ON s_details.id = sph.security_id
      INNER JOIN security_history AS security_summary ON
        security_summary.security_id = sph.security_id
        AND security_summary.date <= sph.date
        AND security_summary.type IN ('buy', 'sell', 'posting')
      -- WHERE sph.security_id IN (1, 10)
      GROUP BY
        sph.security_id,
        s_details.currency,
        sph.date
      ORDER BY sph.date
    ) AS pf_value
    WHERE pf_value.currency = :currency
      AND WEEKDAY(pf_value.date) NOT IN (5, 6)
      AND pf_value.date BETWEEN :startDate AND :endDate
    GROUP BY
      pf_value.currency,
      pf_value.date
    ORDER BY pf_value.date
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ currency, startDate, endDate }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const securityQuotes: PorftolioQuote[] = rows.map((row) => ({
          date: new Date(row.date),
          value: Number(row.value),
          currency: row.currency,
        }));
        resolve(securityQuotes);
      },
    );
  });
};
