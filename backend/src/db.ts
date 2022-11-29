import mysql from 'mysql2';
import * as dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createConnection({
  host: process.env.MY_SQL_DB_HOST,
  user: process.env.MY_SQL_DB_USER,
  password: process.env.MY_SQL_DB_PASSWORD,
  database: process.env.MY_SQL_DB_DATABASE,
  multipleStatements: true,
});
