import * as dotenv from 'dotenv';
import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as path from 'path';
import { orderRouter } from './routes/currencyRouter';
import { securitiesRouter } from './routes/securitiesRouter';

// import compression from 'compression';
// import helmet from 'helmet';
// import { generateToken } from './api/utils/jwt.utils';
import routes from './api/routes';
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
app.use('/currencies', orderRouter);
app.use('/securities', securitiesRouter);

app.listen(port, () => {
  console.log('Node server started running');
});
