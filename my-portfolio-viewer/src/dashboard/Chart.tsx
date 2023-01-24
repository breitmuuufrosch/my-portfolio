import * as React from 'react';
import { Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Scatter,
} from 'recharts';
import { SecurityHistory } from '@backend/types/security';
import { getPortfolioQuotes, getSecurityQuotes, getSecurityTransactionDetailsS } from 'src/types/service';
import { Title } from './Title';
import {
  isoDate,
  formatNumber,
  formatDate,
  formatPercentage,
} from '../data/formatting';

interface HistoryItem {
  date: string,
  value: number,
  traded: SecurityHistory[],
  buy?: number,
  sell?: number,
  dividend?: number,
}

interface Duration {
  label: string,
  start: Date,
  end: Date,
}

function CustomTooltip({ active, payload, label }: any) {
  // console.log(payload);
  if (active && payload && payload.length) {
    return (
      <Grid
        container
        sx={{
          backgroundColor: 'background.paper',
          padding: 1,
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Grid item>{label}</Grid>
        <Grid item sx={{ pb: 2 }}>{`price: ${payload[0].value}`}</Grid>
        {
          payload[0].payload.traded.map((trade: SecurityHistory) => (
            <Grid item key={trade.id}>
              {`${formatDate(trade.date)}: ${trade.type} ${trade.amount} (${trade.value})`}
            </Grid>
          ))
        }
      </Grid>
    );
  }

  return null;
}

function Chart(props: {
  symbol: string,
}) {
  const { symbol } = props;
  const theme = useTheme();

  const [dates, setDates] = React.useState<Date[]>(
    [new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()],
  );
  const [securityHistory, setSecurityHistory] = React.useState<HistoryItem[] | null>(null);
  const [profitLoss, setProfitLoss] = React.useState<number>(0);
  // const [securityTransactions, setSecurityTransactions] = React.useState<SecurityHistory[] | null>(null);
  const [domain, setDomain] = React.useState<number[]>([0, 1]);
  const [durations, setDurations] = React.useState<Duration[]>([]);
  const [currentDuration, setCurrentDuration] = React.useState<string>('1J');

  React.useEffect(() => {
    const newDurations: Duration[] = [];
    [1, 2, 3, 6].forEach((months) => newDurations.push({
      label: `${months}M`,
      start: new Date(new Date().setMonth(new Date().getMonth() - months)),
      end: new Date(),
    }));

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
            setSecurityHistory(result.map((item) => ({ date: isoDate(item.date), value: item.value, traded: [] })));
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
            const newHistory: HistoryItem[] = result.map((item) => ({
              date: isoDate(item.date),
              value: item.close,
              traded: [],
            }));
            const closeValues = result.map((item) => item.close);
            const minValue = Math.min(...closeValues);
            const maxValue = Math.max(...closeValues);
            const range = maxValue - minValue;
            setDomain([minValue - (0.02 * range), maxValue + (0.02 * range)]);

            const firstPrice = closeValues.slice(0)[0];
            const lastPrice = closeValues.slice(-1)[0];
            setProfitLoss((100 * (lastPrice - firstPrice)) / firstPrice);

            getSecurityTransactionDetailsS(symbol)
              .then((transactions: SecurityHistory[]) => {
                transactions.forEach((transaction) => {
                  const dataPoint = newHistory.find((h) => h.date === isoDate(transaction.date));
                  if (dataPoint) {
                    if (transaction.type === 'buy') {
                      dataPoint.buy = transaction.price;
                    } else if (transaction.type === 'sell') {
                      dataPoint.sell = transaction.price;
                    } else if (transaction.type === 'dividend') {
                      dataPoint.dividend = dataPoint.value;
                    }
                  }

                  Array.from({ length: 11 }, (_, i) => i - 5).forEach((i) => {
                    let newDate = new Date(transaction.date);
                    newDate = new Date(newDate.setDate(newDate.getDate() + i));
                    console.log(i, transaction.date, typeof newDate, newDate);
                    const infoDataPoint = newHistory.find((h) => h.date === isoDate(newDate));
                    if (infoDataPoint) {
                      infoDataPoint.traded.push(transaction);
                    }
                  });

                  console.log(newHistory.find((h) => h.date === isoDate(new Date(transaction.date))));
                });

                setSecurityHistory(newHistory);
              });
          },
        );
    }
  }, [symbol, dates]);

  React.useEffect(() => {
    console.log(securityHistory);
  }, [securityHistory]);

  return (
    <>
      <Grid container spacing={0}>
        <Grid container item xs={6} sx={{ flexDirection: 'row' }}>
          <Grid item xs={10}>
            <Title>{symbol}</Title>
          </Grid>
          <Grid item xs={2} style={{ color: (profitLoss > 0) ? 'green' : 'red' }}>
            {formatPercentage(profitLoss, 2)}
          </Grid>
        </Grid>
        <Grid container spacing={1} justifyContent="flex-end" xs={6}>
          {
            durations.map((duration) => (
              <Grid item key={duration.label}>
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
      </Grid>
      <ResponsiveContainer>
        <ComposedChart
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
            tickFormatter={(value: string) => String(formatNumber(Number(value), 2))}
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
            name="Price"
            dataKey="value"
            stroke={theme.palette.primary.main}
            dot={false}
          />
          <Scatter
            isAnimationActive={false}
            name="Buy"
            dataKey="buy"
            shape="triangle"
            fill="green"
            legendType="triangle"
          />
          <Scatter
            isAnimationActive={false}
            name="Sell"
            dataKey="sell"
            shape="triangle"
            fill="red"
            legendType="triangle"
          />
          <Scatter
            isAnimationActive={false}
            name="Dividend"
            dataKey="dividend"
            shape="circle"
            fill="#8884d8"
            legendType="circle"
          />
          {/* {
            securityTransactions && securityTransactions?.map((transaction) => (
              <ReferenceLine x={isoDate(transaction.date)} label={transaction.type} />
            ))
          } */}

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ paddingLeft: 15 }} />
        </ComposedChart>
      </ResponsiveContainer>
      {/* <ResponsiveContainer>
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
            tickFormatter={(value: string) => String(formatNumber(Number(value), 2))}
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
              <ReferenceLine x={isoDate(transaction.date)} label={transaction.type} />
            ))
          }

          <Tooltip />
          <Legend />
        </LineChart>
      </ResponsiveContainer> */}
    </>
  );
}

export { Chart };
