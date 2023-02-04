import { OkPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { AccountTransaction, SecurityTransaction } from '../types/security';

export const doesExistTransaction = (securityTransaction: SecurityTransaction): Promise<boolean> => {
  const queryString = sql(`
    SELECT *
    FROM security_transaction AS st
    WHERE st.security_id = :security_id
      AND st.date = :date
      AND st.type = :type
      AND st.account_id = :account_id
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
    VALUES (:security_id, :date, :type, :account_id, LAST_INSERT_ID(), :price, :amount);
  `);

  const queryForeignCurrency = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :exchange_to_value, 0, 0);
    SET @account_transfer_to := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES (:exchange_from_currency, :exchange_from_value, :exchange_from_fee, :exchange_from_tax);
    SET @account_transfer_from := LAST_INSERT_ID();

    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :value, :fee, :tax);
    SET @money_trade := LAST_INSERT_ID();

    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, 'transfer', :exchange_from_account_id, @account_transfer_from, :account_id, @account_transfer_to);
    SET @account_transaction := LAST_INSERT_ID();

    INSERT INTO security_transaction (
      security_id, date, type, account_id, money_id, price, amount, account_transaction_id
    )
    VALUES (:security_id, :date, :type, :account_id, @money_trade, :price, :amount, @account_transaction);
  `);

  let query;

  if (Object.prototype.hasOwnProperty.call(securityTransaction, 'exchange_from_currency')) {
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
      AND atd.from_account_id ${getComparison('from_account_id')}
      AND atd.to_account_id ${getComparison('to_account_id')}
      AND atd.from_value ${getComparison('from_value')}
      AND atd.to_value ${getComparison('to_value')}
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
    VALUES (:to_currency, :to_value, :to_fee, :to_tax);
    SET @account_transfer_to := LAST_INSERT_ID();
    
    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :type, NULL, NULL, :to_account_id, @account_transfer_to);
  `);

  const queryStringPayout = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:from_currency, :from_value, :from_fee, :from_tax);
    SET @account_transfer_from := LAST_INSERT_ID();
    
    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :type, :from_account_id, @account_transfer_from, NULL, NULL);
  `);

  const queryStringExchange = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:to_currency, :to_value, :to_fee, :to_tax);
    SET @account_transfer_to := LAST_INSERT_ID();
    
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:from_currency, :from_value, :from_fee, :from_tax);
    SET @account_transfer_from := LAST_INSERT_ID();
      
    INSERT INTO account_transaction (date, type, from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :type, :from_account_id, @account_transfer_from, :to_account_id, @account_transfer_to);
  `);

  let query;

  if (
    Object.prototype.hasOwnProperty.call(accountTransaction, 'from_account_id')
    && Object.prototype.hasOwnProperty.call(accountTransaction, 'to_account_id')
  ) {
    query = queryStringExchange;
  } else if (Object.prototype.hasOwnProperty.call(accountTransaction, 'from_account_id')) {
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
