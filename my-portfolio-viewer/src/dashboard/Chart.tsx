import * as React from 'react';
import { Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { SecurityHistory } from '@backend/types/security';
import { getPortfolioQuotes, getSecurityQuotes, getSecurityTransactionDetailsS } from 'src/types/service';
import { Title } from './Title';
import { dateString, rounding } from '../data/formatting';

interface HistoryItem {
  date: Date,
  value: number,
}

interface Duration {
  label: string,
  start: Date,
  end: Date,
}

function Chart(props: {
  symbol: string,
}) {
  const { symbol } = props;
  const theme = useTheme();

  const [dates, setDates] = React.useState<Date[]>([new Date(2021, 1, 1), new Date(2022, 12, 31)]);
  const [securityHistory, setSecurityHistory] = React.useState<HistoryItem[] | null>(null);
  const [securityTransactions, setSecurityTransactions] = React.useState<SecurityHistory[] | null>(null);
  const [domain, setDomain] = React.useState<number[]>([0, 1]);
  const [durations, setDurations] = React.useState<Duration[]>([]);
  const [currentDuration, setCurrentDuration] = React.useState<string>('1J');

  React.useEffect(() => {
    const newDurations: Duration[] = [];
    [1, 2, 3, 5, 10].forEach((years) => newDurations.push({
      label: `${years}J`,
      start: new Date(new Date().setFullYear(new Date().getFullYear() - years)),
      end: new Date(),
    }));

    newDurations.push({
      label: 'YTD', start: new Date(new Date().setFullYear(new Date().getFullYear(), 0, 1)), end: new Date(),
    });
    newDurations.push({ label: 'MAX', start: new Date(1970, 0, 1), end: new Date() });

    setDurations(newDurations);
  }, []);

  React.useEffect(() => {
    console.log('chart', symbol);
    if (['CHF', 'EUR', 'USD'].includes(symbol)) {
      getPortfolioQuotes(symbol, dates[0], dates[1])
        .then(
          (result) => {
            console.log(result);
            // const dictionary = Object.assign({}, ...result.map((x) => ({ [String(x.date)]: x.value })));
            // console.log(dictionary);
            setSecurityHistory(result.map((item) => ({ date: item.date, value: item.value })));
            const closeValues = result.map((item) => item.value);
            const minValue = Math.min(...closeValues);
            const maxValue = Math.max(...closeValues);
            const range = maxValue - minValue;
            setDomain([Math.max(minValue - (0.02 * range), 0), maxValue + (0.02 * range)]);
          },
        );
    } else {
      getSecurityQuotes(symbol, dates[0], dates[1])
        .then(
          (result) => {
            setSecurityHistory(result.map((item) => ({ date: item.date, value: item.close })));
            const closeValues = result.map((item) => item.close);
            const minValue = Math.min(...closeValues);
            const maxValue = Math.max(...closeValues);
            const range = maxValue - minValue;
            setDomain([minValue - (0.02 * range), maxValue + (0.02 * range)]);
          },
        );

      getSecurityTransactionDetailsS(symbol)
        .then(setSecurityTransactions);
    }
  }, [symbol, dates]);

  React.useEffect(() => {
    console.log(securityHistory);
  }, [securityHistory]);

  return (
    <>
      <Title>{symbol}</Title>
      <ResponsiveContainer>
        <LineChart
          data={securityHistory}
          margin={{
            top: 16,
            right: 0,
            bottom: 0,
            left: 24,
          }}
        >
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />

          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
            ticks={dates.map((item) => item.toLocaleDateString())}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
            domain={domain}
            tickFormatter={(value: string) => String(rounding(Number(value), 2))}
          >
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: 'middle',
                fill: theme.palette.text.primary,
                ...theme.typography.body1,
              }}
            >
              Price
            </Label>
          </YAxis>
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="value"
            stroke={theme.palette.primary.main}
            dot={false}
          />
          {
            securityTransactions && securityTransactions?.map((transaction) => (
              <ReferenceLine x={dateString(transaction.date)} label={transaction.type} />
            ))
          }

          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
      <Grid container spacing={1} justifyContent="flex-end">
        {
          durations.map((duration) => (
            <Grid item>
              <Button
                href="#"
                variant={currentDuration === duration.label ? 'contained' : 'text'}
                onClick={() => { setDates([duration.start, duration.end]); setCurrentDuration(duration.label); }}
                sx={{ p: 0.25, m: 0, minWidth: 10 }}
              >
                {duration.label}
              </Button>
            </Grid>
          ))
        }
      </Grid>
    </>
  );
}

export { Chart };
