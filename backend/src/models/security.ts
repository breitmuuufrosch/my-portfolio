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
      s.name_long
    FROM security AS s
    WHERE s.symbol=:symbol
  `);
  const sqlQuery = queryString({ symbol });

  return new Promise((resolve, reject) => {
    db.query(sqlQuery, (err, result) => {
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
    });
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

export const createTransaction = (securityTransaction: SecurityTransaction): Promise<number[]> => {
  const queryString = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :total, :fee, :tax);
    INSERT INTO security_transaction (security_id, date, type, account_id, money_id, price, amount)
    VALUES (:security_id, :date, :type, :account_id, LAST_INSERT_ID(), :price, :amount);
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ ...securityTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        const insertedIds = (<OkPacket[]>result).map((item) => item.insertId);
        resolve(insertedIds);
      },
    );
  });
};

export const createTransactionForeign = (securityTransaction: SecurityTransaction): Promise<number[]> => {
  const queryString = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :total + :fee + :tax, 0, 0);
    SET @account_transfer_to := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES ("CHF", :total_chf, :fee_chf, :tax_chf);
    SET @account_transfer_from := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :total, :fee, :tax);
    SET @money_trade := LAST_INSERT_ID();

    INSERT INTO account_transaction (date, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :account_id_chf, @account_transfer_from, :account_id, @account_transfer_to);
    SET @account_transaction := LAST_INSERT_ID();

    INSERT INTO security_transaction (
      security_id, date, type, account_id, money_id, price, amount, account_transaction_id
    )
    VALUES (:security_id, :date, :type, :account_id, @money_trade, :price, :amount, @account_transaction);
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ ...securityTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        const insertedIds = (<OkPacket[]>result).map((item) => item.insertId);
        resolve(insertedIds);
      },
    );
  });
};

export const findTrades = (): Promise<Trade[]> => {
  const queryString = `
    SELECT
      s.symbol,
      s.currency,
      s.entryPrice,
      s.exitPrice,
      s.number
    FROM trade AS s
  `;

  return new Promise((resolve, reject) => {
    db.query(
      queryString,
      (err, result) => {
        if (err) { reject(err); return; }

        const trades = (<RowDataPacket>result).map((item) => ({
          symbol: item.symbol,
          currency: item.currency,
          entryPrice: item.entry_rice,
          extitPrice: item.exit_price,
          number: item.number,
        }));
        resolve(trades);
      },
    );
  });
};
