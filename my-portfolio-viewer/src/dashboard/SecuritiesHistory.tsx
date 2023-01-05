import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSearchParams } from 'react-router-dom';
import { SecurityTransaction } from '@backend/types/security';
import { Title } from './Title';
import { getSecurityTransactionDetailsS } from '../types/service';
import { rounding } from '../data/formatting';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface SecurityTransactionCum extends SecurityTransaction {
  amountCum: number,
}

export function SecurityHistory() {
  const [searchParams] = useSearchParams();

  const [securities, setSecurities] = React.useState<SecurityTransactionCum[] | null>(null);

  React.useEffect(() => {
    getSecurityTransactionDetailsS(Number(searchParams.get('securityId'))).then(
      (result) => {
        let amountCum = 0;
        setSecurities(
          result
            .map((item) => {
              amountCum += item.type === 'dividend' ? 0 : Number(item.amount);
              return {
                ...item,
                date: new Date(item.date),
                amountCum,
              };
            }),
        );
      },
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
          </TableRow>
        </TableHead>
        <TableBody>
          {securities?.map((row) => (
            <TableRow key={row.date.getTime()}>
              <TableCell>{row.date.toLocaleDateString('de-CH')}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>{rounding(row.amount, 4)}</TableCell>
              <TableCell>{rounding(row.amountCum, 4)}</TableCell>
              {/* <TableCell>{row.isin}</TableCell>
              <TableCell>{row.holdings ? Number(row.holdings) : ''}</TableCell> */}
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
