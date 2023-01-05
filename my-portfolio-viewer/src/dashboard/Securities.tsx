import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Security } from '@backend/types/security';
import { Title } from './Title';
import { getSecurities } from '../types/service';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export function Securities() {
  const [securities, setSecurities] = React.useState<Security[] | null>(null);

  React.useEffect(() => {
    getSecurities().then(
      (result) => setSecurities(result),
    );
  }, []);

  return (
    <>
      <Title>Securities</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>ISIN</TableCell>
            <TableCell>Holdings</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {securities?.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.symbol}</TableCell>
              <TableCell>{row.nameLong}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell>{row.isin}</TableCell>
              <TableCell>{row.holdings ? Number(row.holdings) : ''}</TableCell>
              <TableCell><Link href={`securities/history?securityId=${row.id}`}>History</Link></TableCell>
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
