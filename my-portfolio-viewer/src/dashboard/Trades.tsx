import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TableFooter } from '@mui/material';
import { Trade } from '@backend/types/trade';
import { Chart } from './Chart';
import { Title } from './Title';
import { getTrades } from '../types/service';
import { rounding } from '../data/formatting';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface TradesProps {
  selectSymbol?: (symbol: string) => void,
}

function TradesList({ selectSymbol }: TradesProps) {
  // const { selectSymbol } = props;
  const [trades, setTrades] = React.useState<Trade[] | null>(null);

  React.useEffect(() => {
    getTrades().then(
      (result) => setTrades(result),
    );
  }, []);

  return (
    <>
      <Title>Trades</Title>
      Show Portfolio History
      <Link href="#" onClick={() => selectSymbol('CHF')}>CHF</Link>
      <Link href="#" onClick={() => selectSymbol('EUR')}>EUR</Link>
      <Link href="#" onClick={() => selectSymbol('USD')}>USD</Link>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Entry price</TableCell>
            <TableCell>Entry price (all)</TableCell>
            <TableCell>Exit price</TableCell>
            <TableCell>Last Price</TableCell>
            <TableCell>Last Date</TableCell>
            <TableCell>P/L</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades?.sort((a, b) => a.symbol.localeCompare(b.symbol)).map((row) => (
            <TableRow key={row.symbol}>
              <TableCell>
                {
                  selectSymbol
                    ? (
                      <Link href="#" onClick={() => selectSymbol(row.symbol)}>
                        {row.name}
                      </Link>
                    )
                    : row.name
                }
              </TableCell>
              <TableCell>{row.symbol}</TableCell>
              <TableCell>{Number(row.amount)}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell>{row.entryPrice}</TableCell>
              <TableCell>{row.entryPriceAll}</TableCell>
              <TableCell>{row.exitPrice}</TableCell>
              <TableCell>{row.lastPrice}</TableCell>
              <TableCell>{new Date(row.lastDate)?.toLocaleDateString('de-CH')}</TableCell>
              <TableCell style={{ color: (row.exitPrice - row.entryPriceAll > 0) ? 'green' : 'red' }}>
                {rounding(row.exitPrice - row.entryPriceAll)}
              </TableCell>
              <TableCell style={{ color: (row.exitPrice - row.entryPriceAll > 0) ? 'green' : 'red' }}>
                {`${rounding(100 * ((row.exitPrice - row.entryPriceAll) / row.entryPriceAll))}%`}
              </TableCell>
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
                    trades && rounding(trades.filter((row) => row.currency === currency)
                      .reduce((accumulator, row) => accumulator + row.entryPrice, 0))
                  }
                </TableCell>
                <TableCell>
                  {
                    trades && rounding(trades.filter((row) => row.currency === currency)
                      .reduce((accumulator, row) => accumulator + row.entryPriceAll, 0))
                  }
                </TableCell>
                <TableCell>
                  {
                    trades && rounding(trades.filter((row) => row.currency === currency)
                      .reduce((accumulator, row) => accumulator + row.exitPrice, 0))
                  }
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell>
                  {
                    trades && rounding(trades.filter((row) => row.currency === currency)
                      .reduce((accumulator, row) => accumulator + row.exitPrice - row.entryPriceAll, 0))
                  }
                </TableCell>
                <TableCell>
                  {
                    trades && rounding(
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
            height: 240,
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
