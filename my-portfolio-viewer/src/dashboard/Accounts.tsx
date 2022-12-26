import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { AccountSummary } from '@backend/types/account';
import { Title } from './Title';
import { getAccountSummary } from '../types/service';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export function Accounts() {
  const [accountSummary, setAccountSummary] = React.useState<AccountSummary[] | null>(null);

  React.useEffect(() => {
    getAccountSummary().then(
      (result) => setAccountSummary(result),
    );
  }, []);

  return (
    <>
      <Title>Trades</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accountSummary?.sort((a, b) => {
            if (a.name === b.name) {
              return a.currency.localeCompare(b.currency);
            }
            return a.name.localeCompare(b.name);
          }).map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell>{Number(row.balance)}</TableCell>
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
