import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Chart } from './Chart';
import { Trades } from './Trades';

function DashboardContent() {
  const [symbol, setSymbol] = React.useState('LOGN.SW');

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
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
          <Trades selectSymbol={(symbolP: string) => { console.log(symbolP); setSymbol(symbolP); }} />
        </Paper>
      </Grid>
    </Grid>
  );
}

export function Dashboard() {
  return <DashboardContent />;
}
