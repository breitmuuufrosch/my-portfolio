import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import { Button } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSearchParams } from 'react-router-dom';
import { SecurityHistory } from '@backend/types/security';
import { Title } from './Title';
import {
  getSecurityTransactionDetailsS,
} from '../types/service';
import { formatNumber } from '../data/formatting';
import { SecurityTransactionDialog } from '../dialogs/SecurityTransaction';

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

interface SecurityHistoryCum extends SecurityHistory {
  amountCum: number,
}

export function SecurityHistoryView() {
  const [searchParams] = useSearchParams();
  const [securityHistory, setSecurityHistory] = React.useState<SecurityHistoryCum[] | null>(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [selectedTransactionId, setSelectedTransactionId] = React.useState<number>(0);

  React.useEffect(() => {
    getSecurityTransactionDetailsS(searchParams.get('securityId'))
      .then(
        (result) => {
          let amountCum = 0;
          setSecurityHistory(
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
            <TableCell>Event</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell align="right">Fee</TableCell>
            <TableCell align="right">Tax</TableCell>
            <TableCell align="right">Ammount</TableCell>
            <TableCell align="right">Saldo</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {securityHistory?.map((row) => (
            <TableRow key={`${row.id}-${row.type}`}>
              <TableCell>{row.date.toLocaleDateString('de-CH')}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell align="right">{formatNumber(row.total)}</TableCell>
              <TableCell align="right">{formatNumber(row.value)}</TableCell>
              <TableCell align="right">{formatNumber(row.fee)}</TableCell>
              <TableCell align="right">{formatNumber(row.tax)}</TableCell>
              <TableCell align="right">{formatNumber(row.amount, 4)}</TableCell>
              <TableCell align="right">{formatNumber(row.amountCum, 4)}</TableCell>
              <TableCell>
                <Button color="primary" href="#" onClick={() => { handleOpen(); setSelectedTransactionId(row.id); }}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more orders
      </Link>
      <SecurityTransactionDialog open={open} transactionId={selectedTransactionId} handleClose={handleClose} />
    </>
  );
}
