import { OkPacket } from 'mysql2';
import { mysql as sql } from 'yesql';
import { db } from '../db';
import { AccountTransaction } from '../types/account';

export const doesExist = (accountTransaction: AccountTransaction): Promise<boolean> => {
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

export const create = (accountTransaction: AccountTransaction): Promise<number[]> => {
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
