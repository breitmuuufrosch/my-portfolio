import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  SxProps,
  TableContainer,
  TableFooter,
  Theme,
} from '@mui/material';
import { Trade } from '@backend/types/trade';
import { Chart } from './Chart';
import { Title } from './Title';
import { getTrades } from '../types/service';
import { formatDate, formatNumber, formatPercentage } from '../data/formatting';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface TradesProps {
  selectSymbol?: (symbol: string) => void,
}

const styleStickyHeaderColumn = {
  position: 'sticky',
  left: 0,
  // boxShadow: '5px 2px 5px grey',
  // borderRight: '2px solid black',
  zIndex: 1000,
  bgcolor: 'background.paper',
};
const styleStickyColumn = { ...styleStickyHeaderColumn, zIndex: 100 };

interface Column {
  id: string,
  label: string,
  minWidth?: number,
  align?: 'left' | 'right' | 'center',
  format?: (value: number | Date | string) => string,
  sxHeader?: SxProps<Theme>,
  sxBody?: SxProps<Theme>,
  style?: (trade: Trade) => React.CSSProperties,
}

const columns: readonly Column[] = [
  {
    id: 'name',
    label: 'Name',
    align: 'left',
    sxHeader: styleStickyHeaderColumn,
    sxBody: styleStickyColumn,
  },
  { id: 'symbol', label: 'Label' },
  { id: 'amount', label: 'Amount' },
  { id: 'currency', label: 'Currency' },
  {
    id: 'profitLoss',
    label: 'P/L',
    align: 'right',
    format: formatNumber,
    style: (trade: Trade) => ({ color: (trade.profitLoss > 0) ? 'green' : 'red' }),
  },
  {
    id: 'profitLossPercentage',
    label: 'P/L (%)',
    align: 'right',
    format: formatPercentage,
    style: (trade: Trade) => ({ color: (trade.profitLoss > 0) ? 'green' : 'red' }),
  },
  {
    id: 'entryPrice',
    label: 'Entry price',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'entryPriceAll',
    label: 'Entry price (all)',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'exitPrice',
    label: 'Exit price',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'lastPrice',
    label: 'Last Price',
    align: 'right',
    format: formatNumber,
  },
  { id: 'lastDate', label: 'Last Date', format: formatDate },
];

function TradesList({ selectSymbol }: TradesProps) {
  // const { selectSymbol } = props;
  const [symbol, setSymbol] = React.useState<string>('LOGN.SW');
  const [trades, setTrades] = React.useState<Trade[] | null>(null);

  React.useEffect(() => {
    getTrades().then(
      (result) => setTrades(result),
    );
  }, []);

  React.useEffect(() => {
    if (selectSymbol) { selectSymbol(symbol); }
  }, [symbol]);

  return (
    <>
      <Title>Trades</Title>
      Show Portfolio History
      <Grid container flexDirection="row" justifyContent="center">
        <Link href="#" onClick={() => selectSymbol('CHF')}>CHF</Link>
        <Link href="#" onClick={() => selectSymbol('EUR')}>EUR</Link>
        <Link href="#" onClick={() => selectSymbol('USD')}>USD</Link>
      </Grid>
      <TableContainer sx={{ maxHeight: 660 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {
                columns.map((column) => (
                  <TableCell key={column.id} align={column.align} sx={column.sxHeader}>{column.label}</TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {trades?.sort((a, b) => a.symbol.localeCompare(b.symbol)).map((row) => (
              <TableRow
                hover
                key={row.symbol}
                onClick={() => setSymbol(row.symbol)}
                sx={{ backgroundColor: symbol === row.symbol ? 'background.paper' : 'none' }}
              >
                {
                  columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sx={column.sxBody}
                        style={column.style ? column.style(row) : {}}
                      >
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })
                }
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            {
              ['CHF', 'EUR', 'USD'].map((currency) => (
                <TableRow key={currency}>
                  <TableCell>{currency}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.entryPrice, 0))
                    }
                  </TableCell>
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.entryPriceAll, 0))
                    }
                  </TableCell>
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.exitPrice, 0))
                    }
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    {
                      trades && formatNumber(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + row.exitPrice - row.entryPriceAll, 0))
                    }
                  </TableCell>
                  <TableCell>
                    {
                      trades && formatNumber(
                        100 * (
                          trades.filter((row) => row.currency === currency)
                            .reduce((accumulator, row) => accumulator + row.exitPrice - row.entryPriceAll, 0)
                          / trades.filter((row) => row.currency === currency)
                            .reduce((accumulator, row) => accumulator + row.entryPriceAll, 0)
                        ),
                      )
                    }
                  </TableCell>
                </TableRow>
              ))
            }
          </TableFooter>
        </Table>
      </TableContainer>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more orders
      </Link>
    </>
  );
}

TradesList.defaultProps = {
  selectSymbol: () => { },
};

function Trades() {
  const [symbol, setSymbol] = React.useState('LOGN.SW');

  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={12}
        sx={{
          // position: '-webkit-sticky',
          position: 'sticky',
          top: 30,
        }}
      >
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 300,
          }}
        >
          <Chart symbol={symbol} />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <TradesList selectSymbol={(symbolP: string) => { console.log(symbolP); setSymbol(symbolP); }} />
        </Paper>
      </Grid>
    </Grid>
  );
}

export { Trades };
