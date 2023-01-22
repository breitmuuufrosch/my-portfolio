import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { getAccountSummary, getTrades } from '../types/service';
import { groupBy, getTotal, CurrencyOverview } from '../data/overview';
import { rounding } from '../data/formatting';

function DashboardContent() {
  const [trades, setTrades] = React.useState<CurrencyOverview[] | null>(null);
  const [accounts, setAccounts] = React.useState<CurrencyOverview[] | null>(null);
  const [all, setAll] = React.useState<CurrencyOverview[] | null>(null);

  React.useEffect(() => {
    Promise.all([getTrades(), getAccountSummary()])
      .then(([tradesResult, accountsResult]) => {
        const tradeSummary = getTotal(groupBy(tradesResult, 'currency'), 'exitPrice');
        setTrades(tradeSummary);

        const accountSummary = getTotal(groupBy(accountsResult, 'currency'), 'balance');
        setAccounts(accountSummary);

        const allCurrencies = new Set<string>();
        tradeSummary.forEach((item) => allCurrencies.add(item.currency));
        accountSummary.forEach((item) => allCurrencies.add(item.currency));

        const allOverviews: CurrencyOverview[] = [];
        allCurrencies.forEach((currency) => {
          const sumTrades = tradeSummary.find((item) => item.currency === currency).sum ?? 0;
          const sumAccounts = accountSummary.find((item) => item.currency === currency).sum ?? 0;
          allOverviews.push({
            currency,
            sum: sumTrades + sumAccounts,
          });
        });
        setAll(allOverviews);
      });
  }, []);

  const styleElement = {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    height: 240,
  };

  return (
    <Grid container spacing={2}>
      <Grid container item xs={4}>
        <Paper sx={styleElement}>
          <Grid item xs={12}>
            {
              trades && trades.map((item) => (
                <>
                  <Grid item xs={6}>{item.currency}</Grid>
                  <Grid item xs={6}>{rounding(item.sum, 2)}</Grid>
                </>
              ))
            }
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        {
          accounts && accounts.map((item) => (
            <>
              <Grid item xs={6}>{item.currency}</Grid>
              <Grid item xs={6}>{rounding(item.sum, 2)}</Grid>
            </>
          ))
        }
      </Grid>
      <Grid item xs={4}>
        {
          all && all.map((item) => (
            <>
              <Grid item xs={6}>{item.currency}</Grid>
              <Grid item xs={6}>{rounding(item.sum, 2)}</Grid>
            </>
          ))
        }
      </Grid>
    </Grid>
  );
}

export function Dashboard() {
  return <DashboardContent />;
}
