import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Trade } from '@backend/types/trade';
import { Title } from './Title';
import { getTrades } from '../types/trade';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export function Orders() {
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
          {trades?.map((row) => (
            <TableRow key={row.symbol}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.symbol}</TableCell>
              <TableCell>{Number(row.number)}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell>{row.entryPrice}</TableCell>
              <TableCell>{row.entryPriceAll}</TableCell>
              <TableCell>{row.exitPrice}</TableCell>
              <TableCell>{Math.round((row.exitPrice - row.entryPriceAll) * 1000) / 1000}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more orders
      </Link>
    </>
  );
}
