import * as dotenv from 'dotenv';
import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
// import * as path from 'path';
import { accountRouter } from './routes/accountRouter';
import { accountTransactionRouter } from './routes/accountTransactionRouter';
import { currencyRouter } from './routes/currencyRouter';
import { depotRouter } from './routes/depotRouter';
import { dividendRouter } from './routes/dividendRouter';
import { portfolioRouter } from './routes/portfolioRouter';
import { securityPriceRouter } from './routes/securityPriceRouter';
import { securityTransactionRouter } from './routes/securityTransactionRouter';
import { securityRouter } from './routes/securityRouter';
import { tradeRouter } from './routes/tradeRouter';

// import compression from 'compression';
// import helmet from 'helmet';
// import { generateToken } from './api/utils/jwt.utils';
// import routes from './api/routes';
// import logger from './api/middlewares/logger.middleware';
// import errorHandler from './api/middlewares/error-handler.middleware';
// import * as MySQLConnector from './api/utils/mysql.connector';

// const app = express();
const port = 3333;

// // Only generate a token for lower level environments
// // if (process.env.NODE_ENV !== 'production') {
// //   console.log('JWT', generateToken());
// // }

// // create database pool
// MySQLConnector.init();

// // serve static files
// app.use(express.static(path.join(__dirname, '../public')));

// // // compresses all the responses
// // app.use(compression());

// // // adding set of security middlewares
// // app.use(helmet());

// // parse incoming request body and append data to `req.body`
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // // enable all CORS request
// // app.use(cors());

// // // add logger middleware
// // app.use(logger);

// app.use('/api/', routes);

// // // add custom error handler middleware as the last middleware
// // app.use(errorHandler);

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// });

const app = express();
dotenv.config();

// enable all CORS request
const corsOptions = {
  origin: 'http://localhost:3000',
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use('/accounts', accountRouter);
app.use('/account-transactions', accountTransactionRouter);
app.use('/currencies', currencyRouter);
app.use('/depots', depotRouter);
app.use('/dividends', dividendRouter);
app.use('/portfolio', portfolioRouter);
app.use('/securities', securityRouter);
app.use('/security-prices', securityPriceRouter);
app.use('/security-transactions', securityTransactionRouter);
app.use('/trades', tradeRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info('Node server started running');
});
