import { OkPacket, RowDataPacket } from 'mysql2';
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
      }
    );
  });
}

export const findAll = (): Promise<SecurityTransaction[]> => {
  const queryString = sql(`
    SELECT *
    FROM account_history AS ah
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({}),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const securityTransactions: SecurityTransaction[] = rows.map((row) => ({
          security_id: row.security_id,
          symbol: row.symbol,
          date: row.date,
          type: row.type,
          acount_id: row.account_id,
          currency: row.currency,
          price: row.price,
          amount: row.amount,
          value: row.value,
          fee: row.fee,
          tax: row.tax,
        }))
        resolve(securityTransactions);
      }
    );
  });
}

export const findByType = (type: string): Promise<SecurityTransaction[]> => {
  const queryString = sql(`
    SELECT *
    FROM account_history AS ah
    WHERE ah.type = :type
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ type }),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const securityTransactions: SecurityTransaction[] = rows.map((row) => ({
          security_id: row.security_id,
          symbol: row.symbol,
          date: row.date,
          type: row.type,
          acount_id: row.account_id,
          currency: row.currency,
          price: row.price,
          amount: row.amount,
          value: row.value,
          fee: row.fee,
          tax: row.tax,
        }))
        resolve(securityTransactions);
      }
    );
  });
}

export const findBySecurityId = (securityId: number): Promise<SecurityTransaction[]> => {
  const queryString = sql(`
    SELECT *
    FROM security_transaction_summary AS sts
    WHERE sts.security_id = :securityId
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({securityId}),
      (err, result) => {
        if (err) { reject(err); return; }

        const rows = <RowDataPacket[]>result;
        const securityTransactions: SecurityTransaction[] = rows.map((row) => ({
          security_id: row.security_id,
          symbol: row.symbol,
          date: row.date,
          type: row.type,
          acount_id: row.account_id,
          currency: row.currency,
          price: row.price,
          amount: row.amount,
          value: row.value,
          fee: row.fee,
          tax: row.tax,
        }))
        resolve(securityTransactions);
      }
    );
  });
}

export const createTransaction = (securityTransaction: SecurityTransaction): Promise<number[]> => {
  const queryString = sql(`
    INSERT INTO money (currency, value, fee, tax)
    VALUES (:currency, :value, :fee, :tax);
    INSERT INTO security_transaction (security_id, date, type, account_id, money_id, price, amount)
    VALUES (:security_id, :date, :type, :account_id, LAST_INSERT_ID(), :price, :amount);
  `);

  console.log('create div', queryString({ ...securityTransaction }));

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

export const doesExistAccountTransaction = (accountTransaction: AccountTransaction): Promise<boolean> => {
  const queryString = sql(`
    SELECT *
    FROM (
      SELECT act.date, act.type, act.from_account_id, act.to_account_id, m_from.value AS from_value, m_to.value AS to_value
      FROM account_transaction AS act
      LEFT JOIN money AS m_from ON m_from.id = act.from_money_id
      LEFT JOIN money AS m_to ON m_to.id = act.to_money_id
    ) AS act
    WHERE act.date = :date
      AND act.type = :type
      AND act.from_account_id ${accountTransaction.hasOwnProperty('from_account_id') ? '= ' + accountTransaction.from_account_id : 'IS NULL'}
      AND act.to_account_id ${accountTransaction.hasOwnProperty('to_account_id') ? '= ' + accountTransaction.to_account_id : 'IS NULL'}
      AND act.from_value ${accountTransaction.hasOwnProperty('from_value') ? '= ' + accountTransaction.from_value : 'IS NULL'}
      AND act.to_value ${accountTransaction.hasOwnProperty('to_value') ? '= ' + accountTransaction.to_value : 'IS NULL'}
  `);

  return new Promise((resolve, reject) => {
    db.query(
      queryString({ ...accountTransaction }),
      (err, result) => {
        if (err) { reject(err); return; }

        resolve((<OkPacket[]>result).length > 0);
      }
    );
  });
}

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
      
    INSERT INTO account_transaction (date, 'type', from_account_id, from_money_id, to_account_id, to_money_id)
    VALUES (:date, :type, :from_account_id, @account_transfer_from, :to_account_id, @account_transfer_to);
  `);

  let query;

  console.log(accountTransaction);

  if (accountTransaction.hasOwnProperty('from_account_id') && accountTransaction.hasOwnProperty('to_account_id')) {
    query = queryStringExchange;
    console.log('both');
  } else if (accountTransaction.hasOwnProperty('from_account_id')) {
    query = queryStringPayout;
    console.log('payout');
  } else {
    query = queryStringPayment;
    console.log('payment');
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
