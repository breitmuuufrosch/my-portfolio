import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { SecurityTransactionSummary } from '@backend/types/security';
import { Chart } from './Chart';
import { getSecurityTransactionDetails } from '../types/service';
import { formatDate, formatNumber } from '../data/formatting';
import { SecurityTransactionDialog } from '../dialogs/SecurityTransaction';
import { CustomColumn, CustomTable } from '../components/Table';

interface SecurityTransactionSummaryCum extends SecurityTransactionSummary {
  amountCum: number,
}

export function SecurityTransactionSummaryView() {
  const [searchParams] = useSearchParams();
  const [securityHistory, setSecurityHistory] = React.useState<SecurityTransactionSummaryCum[] | null>(null);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const symbol = searchParams.get('securityId');

  const [selectedTransactionId, setSelectedTransactionId] = React.useState<number>(0);

  const columns: CustomColumn<SecurityTransactionSummaryCum>[] = [
    {
      id: 'date',
      label: 'Date',
      align: 'left',
      format: formatDate,
    },
    { id: 'type', label: 'Action' },
    {
      id: 'total',
      label: 'Total',
      align: 'right',
      format: formatNumber,
    },
    {
      id: 'value',
      label: 'Value',
      align: 'right',
      format: formatNumber,
    },
    {
      id: 'fee',
      label: 'Fee',
      align: 'right',
      format: formatNumber,
    },
    {
      id: 'tax',
      label: 'Tax',
      align: 'right',
      format: formatNumber,
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right',
      format: (value: number) => formatNumber(value, 4),
    },
    {
      id: 'amountCum',
      label: 'Cumulative Amount',
      align: 'right',
      format: (value: number) => formatNumber(value, 4),
    },
    {
      id: 'actions',
      label: 'Actions',
      components: [
        (item: SecurityTransactionSummaryCum) => (
          <Button
            key={item.id}
            color="primary"
            href="#"
            onClick={() => { handleOpen(); setSelectedTransactionId(item.id); }}
          >
            Edit
          </Button>
        ),
      ],
    },
  ];

  React.useEffect(() => {
    getSecurityTransactionDetails(symbol)
      .then(
        (result) => {
          let amountCum = 0;
          setSecurityHistory(
            result
              .sort((a: SecurityTransactionSummary, b: SecurityTransactionSummary) => (
                a.date.valueOf() - b.date.valueOf() || a.type.localeCompare(b.type)
              ))
              .map((item) => {
                amountCum += item.type === 'dividend' ? 0 : Number(item.amount);
                return {
                  ...item,
                  date: new Date(item.date),
                  amountCum,
                };
              })
              .sort((a: SecurityTransactionSummaryCum, b: SecurityTransactionSummaryCum) => (
                b.date.valueOf() - a.date.valueOf() || b.type.localeCompare(a.type)
              )),
          );
        },
      );
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={12}
        sx={{
          position: 'sticky',
          bottom: 10,
          width: '100%',
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
        <CustomTable
          maxHeight={window.innerHeight - 64 - 52 - 32 - 32 - 16 - 16 - 300 - 3 * 8}
          columns={columns}
          data={securityHistory}
          dataKey="id"
          activeKey=""
          setActive={() => { }}
        />
        <SecurityTransactionDialog open={open} transactionId={selectedTransactionId} handleClose={handleClose} />
      </Grid>
    </Grid>
  );
}
