import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TableFooter } from '@mui/material';
import { Trade } from '@backend/types/trade';
import { Title } from './Title';
import { getTrades } from '../types/service';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

const rounding = (value?: number) => Math.round(value * 1000) / 1000;

// const TradesNew = ({selectSymbol: undefined}) => (
//   <>
//     <div>yeah</div>
//   </>
// );
// function TradesNew2 = ({selectSymbol: undefined}) => (
//   <>
//     <div>yeah</div>
//   </>
// );

interface TradesProps {
  selectSymbol?: (symbol: string) => void,
}

function Trades({ selectSymbol }: TradesProps) {
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
              <TableCell>{Number(row.number)}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell>{row.entryPrice}</TableCell>
              <TableCell>{row.entryPriceAll}</TableCell>
              <TableCell>{row.exitPrice}</TableCell>
              <TableCell>{row.lastPrice}</TableCell>
              <TableCell style={{ color: (row.exitPrice - row.entryPriceAll > 0) ? 'green' : 'red' }}>
                {rounding(row.exitPrice - row.entryPriceAll)}
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
                    trades
                      ? rounding(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + Number(row.entryPrice), 0))
                      : ''
                  }
                </TableCell>
                <TableCell>
                  {
                    trades
                      ? rounding(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + Number(row.entryPriceAll), 0))
                      : ''
                  }
                </TableCell>
                <TableCell>
                  {
                    trades
                      ? rounding(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + Number(row.exitPrice), 0))
                      : ''
                  }
                </TableCell>
                <TableCell />
                <TableCell>
                  {
                    trades
                      ? rounding(trades.filter((row) => row.currency === currency)
                        .reduce((accumulator, row) => accumulator + Number(row.exitPrice - row.entryPriceAll), 0))
                      : ''
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

Trades.defaultProps = {
  selectSymbol: () => { },
};

export { Trades };
