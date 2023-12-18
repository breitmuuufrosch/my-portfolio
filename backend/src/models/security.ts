import { OkPacket, RowDataPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { PorftolioQuote, Security, SecurityPrice } from '../types/security';

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
        } catch (error: any) {
          reject(new Error(`${symbol}: ${String(error)}`));
        }
      },
    );
  });
};

export const findAll = (userId: number): Promise<Security[]> => {
  const queryString = `
    SELECT
      s.id,
      s.name,
      s.symbol,
      s.quote_type,
      s.currency,
      s.isin,
      s.valor,
      s.info,
      s.source,
      s.source_url,
      s.entry_price,
      s.entry_fee,
      s.entry_tax,
      s.entry_price_all,
      s.amount,
      s.last_price,
      s.last_date,
      s.exit_price,
      s.profit_loss,
      s.profit_loss_percentage
    FROM security_summary AS s
    WHERE
      s.user_id = :userId OR :userId = -1
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ userId }),
      (err, result) => {
        if (err) { console.log(sql(queryString)({ userId })); reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const security: Security[] = rows.map((row) => ({
          id: row.id,
          symbol: row.symbol,
          currency: row.currency,
          quoteType: row.quote_type,
          isin: row.isin,
          valor: row.valor,
          nameShort: row.name,
          nameLong: row.name,
          info: row.info,
          source: row.source,
          source_url: row.source_url,
          holdings: row.amount,
        }));
        resolve(security);
      },
    );
  });
};

export const create = (security: Security): Promise<number> => {
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
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ ...security, valor: undefined, info: JSON.stringify(security.info) }),
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

export const getHistory = (securityId: number, startDate?: Date, endDate?: Date): Promise<SecurityPrice[]> => {
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
    FROM security_price as sph
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
        const securityQuotes: SecurityPrice[] = rows.map((row) => ({
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
