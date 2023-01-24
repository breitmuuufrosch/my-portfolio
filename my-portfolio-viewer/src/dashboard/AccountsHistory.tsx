import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSearchParams } from 'react-router-dom';
import { AccountHistory } from '@backend/types/account';
import { Title } from './Title';
import { getAccountHistory } from '../types/service';
import { formatNumber } from '../data/formatting';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface AccountHistoryCum extends AccountHistory {
  cumsum: number,
}

export function AccountsHistory() {
  const [searchParams] = useSearchParams();

  const [accountSummary, setAccountSummary] = React.useState<AccountHistoryCum[] | null>(null);

  React.useEffect(() => {
    getAccountHistory(Number(searchParams.get('accountId'))).then(
      (result) => {
        let cumsum = 0;

        setAccountSummary(
          result
            .map((item) => ({ ...item, date: new Date(item.date) }))
            // .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((item) => {
              cumsum += Number(item.total);
              return { ...item, cumsum };
            }),
        );
      },
    );
  }, []);

  return (
    <>
      <Title>Trades</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Security</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell align="right">Cumulative Sum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accountSummary?.map((row) => (
            <TableRow key={`${row.id}-${row.type}`}>
              <TableCell>{row.date.toLocaleDateString('de-CH')}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.nameShort}</TableCell>
              <TableCell align="right">{`${formatNumber(Number(row.total))} ${row.currency}`}</TableCell>
              <TableCell align="right">{formatNumber(row.cumsum, 2)}</TableCell>
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
