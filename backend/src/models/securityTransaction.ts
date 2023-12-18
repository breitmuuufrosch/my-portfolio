import { OkPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { SecurityTransaction } from '../types/security';

export const doesExist = (securityTransaction: SecurityTransaction): Promise<boolean> => {
  const queryString = sql(`
    SELECT *
    FROM security_transaction AS st
    WHERE st.security_id = :securityId
      AND st.date = :date
      AND st.type = :type
      AND st.account_id = :accountId
      AND st.price = :price
      AND st.amount = :amount
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ ...securityTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        resolve((<OkPacket[]>result).length > 0);
      },
    );
  });
};

export const create = (securityTransaction: SecurityTransaction): Promise<number[]> => {
  const queryMainCurrency = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :value, :fee, :tax);
    INSERT INTO security_transaction (security_id, date, type, account_id, money_id, price, amount)
    VALUES (:securityId, :date, :type, :accountId, LAST_INSERT_ID(), :price, :amount);
  `);

  const queryForeignCurrency = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :exchangeToValue, 0, 0);
    SET @account_transfer_to := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES (:exchangeFromCurrency, :exchangeFromValue, :exchangeFromFee, :exchangeFromTax);
    SET @account_transfer_from := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :value, :fee, :tax);
    SET @money_trade := LAST_INSERT_ID();

    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, 'transfer', :exchangeFromAccountId, @account_transfer_from, :accountId, @account_transfer_to);
    SET @account_transaction := LAST_INSERT_ID();

    INSERT INTO security_transaction (
      security_id, date, type, account_id, money_id, price, amount, account_transaction_id
    )
    VALUES (:securityId, :date, :type, :accountId, @money_trade, :price, :amount, @account_transaction);
  `);

  let query = queryMainCurrency;

  if (Object.prototype.hasOwnProperty.call(securityTransaction, 'exchangeFromCurrency')) {
    query = queryForeignCurrency;
  }

  return new Promise((resolve, reject) => {
    db.query(
      query({ ...securityTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        const insertedIds = (<OkPacket[]>result).map((item) => item.insertId);
        resolve(insertedIds);
      },
    );
  });
};

export const update = (securityTransaction: SecurityTransaction): Promise<number[]> => {
  const queryMainCurrency = sql(`
    UPDATE money
    SET currency = :currency, value = :value, fee = :fee, tax = :tax
    WHERE id = :moneyId;
    
    UPDATE security_transaction 
    SET security_id = :securityId, date = :date, type = :type, account_id = :accountId, price = :price, amount = :amount
    WHERE id = :id;
  `);

  const queryForeignCurrency = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :exchangeToValue, 0, 0);
    SET @account_transfer_to := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES (:exchangeFromCurrency, :exchangeFromValue, :exchangeFromFee, :exchangeFromTax);
    SET @account_transfer_from := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :value, :fee, :tax);
    SET @money_trade := LAST_INSERT_ID();

    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, 'transfer', :exchangeFromAccountId, @account_transfer_from, :accountId, @account_transfer_to);
    SET @account_transaction := LAST_INSERT_ID();

    INSERT INTO security_transaction (
      security_id, date, type, account_id, money_id, price, amount, account_transaction_id
    )
    VALUES (:securityId, :date, :type, :accountId, @money_trade, :price, :amount, @account_transaction);
  `);

  let query = queryMainCurrency;

  if (Object.prototype.hasOwnProperty.call(securityTransaction, 'exchangeFromCurrency')) {
    console.log('nope, not yet');
    // query = queryForeignCurrency;
  }

  return new Promise((resolve, reject) => {
    console.log(securityTransaction);
    db.query(
      query({ ...securityTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        const insertedIds = (<OkPacket[]>result).map((item) => item.insertId);
        resolve(insertedIds);
      },
    );
  });
};