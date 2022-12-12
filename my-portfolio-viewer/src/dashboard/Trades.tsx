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

export function Trades() {
  const [trades, setTrades] = React.useState<Trade[] | null>(null);

  React.useEffect(() => {
    getTrades().then(
      (result) => setTrades(result),
    );
  }, []);

  return (
    <>
      <Title>Trades</Title>
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
            <TableCell>P/L</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades?.sort((a, b) => a.symbol.localeCompare(b.symbol)).map((row) => (
            <TableRow key={row.symbol}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.symbol}</TableCell>
              <TableCell>{Number(row.number)}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell>{row.entryPrice}</TableCell>
              <TableCell>{row.entryPriceAll}</TableCell>
              <TableCell>{row.exitPrice}</TableCell>
              <TableCell>{rounding(row.exitPrice - row.entryPriceAll)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>CHF</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'CHF')
                  .reduce((accumulator, row) => accumulator + Number(row.entryPrice), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'CHF')
                  .reduce((accumulator, row) => accumulator + Number(row.entryPriceAll), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'CHF')
                  .reduce((accumulator, row) => accumulator + Number(row.exitPrice), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'CHF')
                  .reduce((accumulator, row) => accumulator + Number(row.exitPrice - row.entryPriceAll), 0))
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>EUR</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'EUR')
                  .reduce((accumulator, row) => accumulator + Number(row.entryPrice), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'EUR')
                  .reduce((accumulator, row) => accumulator + Number(row.entryPriceAll), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'EUR')
                  .reduce((accumulator, row) => accumulator + Number(row.exitPrice), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'EUR')
                  .reduce((accumulator, row) => accumulator + Number(row.exitPrice - row.entryPriceAll), 0))
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>USD</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'USD')
                  .reduce((accumulator, row) => accumulator + Number(row.entryPrice), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'USD')
                  .reduce((accumulator, row) => accumulator + Number(row.entryPriceAll), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'USD')
                  .reduce((accumulator, row) => accumulator + Number(row.exitPrice), 0))
              }
            </TableCell>
            <TableCell>
              {
                rounding(trades?.filter((row) => row.currency === 'USD')
                  .reduce((accumulator, row) => accumulator + Number(row.exitPrice - row.entryPriceAll), 0))
              }
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more orders
      </Link>
    </>
  );
}
