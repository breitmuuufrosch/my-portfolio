import { OkPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { AccountTransaction } from '../types/account';
import { SecurityTransaction } from '../types/security';

export const doesExistTransaction = (securityTransaction: SecurityTransaction): Promise<boolean> => {
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

export const createTransaction = (securityTransaction: SecurityTransaction): Promise<number[]> => {
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

  let query;

  if (Object.prototype.hasOwnProperty.call(securityTransaction, 'exchangeFromCurrency')) {
    query = queryForeignCurrency;
  } else {
    query = queryMainCurrency;
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

export const doesExistAccountTransaction = (accountTransaction: AccountTransaction): Promise<boolean> => {
  const getComparison = (propertyName: string) => {
    if (Object.prototype.hasOwnProperty.call(accountTransaction, propertyName)) {
      return ` = ${accountTransaction[propertyName]}`;
    }
    return 'IS NULL';
  };

  const queryString = `
    SELECT *
    FROM account_transaction_detailed AS atd
    WHERE
      atd.date = :date
      AND atd.type = :type
      AND atd.from_account_id ${getComparison('fromAccountId')}
      AND atd.to_account_id ${getComparison('toAccountId')}
      AND atd.from_value ${getComparison('fromValue')}
      AND atd.to_value ${getComparison('toValue')}
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql(queryString)({ ...accountTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        resolve((<OkPacket[]>result).length > 0);
      },
    );
  });
};

export const createAccountTransaction = (accountTransaction: AccountTransaction): Promise<number[]> => {
  const queryStringPayment = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:toCurrency, :toValue, :toFee, :toTax);
    SET @account_transfer_to := LAST_INSERT_ID();
    
    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :type, NULL, NULL, :toAccountId, @account_transfer_to);
  `);

  const queryStringPayout = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:fromCurrency, :fromValue, :fromFee, :fromTax);
    SET @account_transfer_from := LAST_INSERT_ID();
    
    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :type, :fromAccountId, @account_transfer_from, NULL, NULL);
  `);

  const queryStringExchange = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:toCurrency, :toValue, :toFee, :toTax);
    SET @account_transfer_to := LAST_INSERT_ID();
    
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:fromCurrency, :fromValue, :fromFee, :fromTax);
    SET @account_transfer_from := LAST_INSERT_ID();
      
    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :type, :fromAccountId, @account_transfer_from, :toAccountId, @account_transfer_to);
  `);

  let query;

  if (
    Object.prototype.hasOwnProperty.call(accountTransaction, 'fromAccountId')
    && Object.prototype.hasOwnProperty.call(accountTransaction, 'toAccountId')
  ) {
    query = queryStringExchange;
  } else if (Object.prototype.hasOwnProperty.call(accountTransaction, 'fromAccountId')) {
    query = queryStringPayout;
  } else {
    query = queryStringPayment;
  }

  return new Promise((resolve, reject) => {
    db.query(
      query({ ...accountTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        const insertedIds = (<OkPacket[]>result).map((item) => item.insertId);
        resolve(insertedIds);
      },
    );
  });
};
