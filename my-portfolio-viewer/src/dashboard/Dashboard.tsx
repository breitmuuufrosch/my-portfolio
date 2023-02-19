import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { getAccountSummary, getTrades } from '../types/service';
import { groupBy, getTotal, CurrencyOverview } from '../data/overview';
import { formatNumber } from '../data/formatting';
import { Title } from './Title';

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
        <Grid item xs={12}>
          <Paper sx={styleElement}>
            <Title>Deposit</Title>
            <Grid container>
              {
                trades && trades.map((item) => (
                  <Grid container item key={item.currency}>
                    <Grid item xs={6}>{item.currency}</Grid>
                    <Grid item xs={6} textAlign="right">{formatNumber(item.sum, 2)}</Grid>
                  </Grid>
                ))
              }
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid item xs={4}>
        <Paper sx={styleElement}>
          <Title>Savings</Title>
          <Grid container>
            {
              accounts && accounts.map((item) => (
                <Grid container item key={item.currency}>
                  <Grid item xs={6}>{item.currency}</Grid>
                  <Grid item xs={6} textAlign="right">{formatNumber(item.sum, 2)}</Grid>
                </Grid>
              ))
            }
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper sx={styleElement}>
          <Title>Total</Title>
          <Grid container>
            {
              all && all.map((item) => (
                <Grid container item key={item.currency}>
                  <Grid item xs={6}>{item.currency}</Grid>
                  <Grid item xs={6} textAlign="right">{formatNumber(item.sum, 2)}</Grid>
                </Grid>
              ))
            }
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

export function Dashboard() {
  return <DashboardContent />;
}
