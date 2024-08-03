import * as React from 'react';
import { Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Scatter,
} from 'recharts';
import { PorftolioQuote, SecurityTransactionSummary } from '@backend/types/security';
import { getPortfolioQuotes, getSecurityQuotes, getSecurityTransactionDetails } from 'src/types/service';
import { Title } from './Title';
import {
  isoDate,
  formatNumber,
  formatDate,
  formatPercentage,
} from '../data/formatting';
import { TriangleShape } from '../components/TriangleShape';

interface HistoryItem {
  date: string,
  value: number,
  traded: SecurityTransactionSummary[],
  buy?: number,
  sell?: number,
  dividend?: number,
  posting?: number,
  vesting?: number,
  size?: number,
}

interface Duration {
  label: string,
  start: Date,
  end: Date,
}

enum ViewMode {
  PRICE = 'price',
  PL = 'pl',
  VALUE = 'value',
}

function CustomTooltip({ active, payload, label }: any) {
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
        <Grid item sx={{ pb: 2 }}>{`price: ${formatNumber(payload[0].value)}`}</Grid>
        {
          payload[0].payload.traded.map((trade: SecurityTransactionSummary) => (
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
  accountId?: number,
}) {
  const { symbol, accountId } = props;
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
  const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.PRICE);
  const [availableViewModes, setAvailableViewModes] = React.useState<ViewMode[]>([
    ViewMode.VALUE,
    ViewMode.PL,
    ViewMode.PRICE,
  ]);

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
    newDurations.push({ label: 'Trade', start: new Date(1970, 0, 1), end: new Date() });

    setDurations(newDurations);
  }, []);

  const calculateChartValue = (item: PorftolioQuote): number => {
    switch (viewMode) {
      case ViewMode.PRICE:
        return item.close;
      case ViewMode.PL:
        return item.value - item.entryPrice;
      default:
        return item.value;
    }
  };

  React.useEffect(() => {
    console.log('chart', symbol);

    if (['CHF', 'EUR', 'USD'].includes(symbol)) {
      getPortfolioQuotes(symbol, dates[0], dates[1])
        .then(
          (result) => {
            setAvailableViewModes([ViewMode.PL, ViewMode.VALUE]);
            setViewMode(viewMode === ViewMode.PRICE ? ViewMode.VALUE : viewMode);
            // const dictionary = Object.assign({}, ...result.map((x) => ({ [String(x.date)]: x.value })));
            // console.log(dictionary);
            const newHistory: HistoryItem[] = result.map((item) => ({
              date: isoDate(item.date),
              value: calculateChartValue(item), // viewMode ? item.value - item.entryPrice : item.value,
              traded: [],
            }));
            setSecurityHistory(newHistory);
            const closeValues = newHistory.map((item) => item.value);
            const minValue = Math.min(...closeValues);
            const maxValue = Math.max(...closeValues);
            const range = maxValue - minValue;
            setDomain([Math.max(minValue - (0.05 * range), 0), maxValue + (0.05 * range)]);
          },
        );
    } else {
      getSecurityTransactionDetails(symbol, accountId)
        .then((transactions: SecurityTransactionSummary[]) => {
          let startDate = dates[0];

          if (currentDuration === 'Trade') {
            startDate = new Date(transactions.map((item) => item.date).reduce((pre, cur) => (pre > cur ? cur : pre)));
            startDate = new Date(startDate.setDate(startDate.getDate() - 1));
          }

          getSecurityQuotes(symbol, startDate, dates[1])
            .then(
              (result) => {
                setAvailableViewModes([ViewMode.PRICE, ViewMode.PL, ViewMode.VALUE]);
                const newHistory: HistoryItem[] = result.map((item) => ({
                  date: isoDate(item.date),
                  value: calculateChartValue(item), // viewMode ? item.value - item.entryPrice : item.close,
                  traded: [],
                }));
                const closeValues = newHistory.map((item) => item.value);
                const minValue = Math.min(...closeValues);
                const maxValue = Math.max(...closeValues);
                const range = maxValue - minValue;
                setDomain([minValue - (0.05 * range), maxValue + (0.05 * range)]);

                const firstPrice = closeValues.slice(0)[0];
                const lastPrice = closeValues.slice(-1)[0];
                setProfitLoss((100 * (lastPrice - firstPrice)) / firstPrice);

                transactions.forEach((transaction) => {
                  const dataPoint = newHistory.find((h) => h.date === isoDate(transaction.date));
                  if (dataPoint) {
                    if (transaction.type === 'buy') {
                      dataPoint.buy = viewMode !== ViewMode.PRICE ? dataPoint.value : transaction.price;
                    } else if (transaction.type === 'sell') {
                      dataPoint.sell = viewMode !== ViewMode.PRICE ? dataPoint.value : transaction.price;
                    } else if (transaction.type === 'dividend') {
                      dataPoint.dividend = dataPoint.value;
                    } else if (transaction.type === 'posting') {
                      dataPoint.posting = viewMode !== ViewMode.PRICE ? dataPoint.value : transaction.price;
                    } else if (transaction.type === 'vesting') {
                      dataPoint.vesting = viewMode !== ViewMode.PRICE ? dataPoint.value : transaction.price;
                    }
                  }

                  Array.from({ length: 11 }, (_, i) => i - 5).forEach((i) => {
                    let newDate = new Date(transaction.date);
                    newDate = new Date(newDate.setDate(newDate.getDate() + i));
                    const infoDataPoint = newHistory.find((h) => h.date === isoDate(newDate));
                    if (infoDataPoint) {
                      infoDataPoint.traded.push(transaction);
                    }
                  });
                });

                setSecurityHistory(newHistory);
              },
            );
        });
    }
  }, [symbol, accountId, dates, viewMode]);

  React.useEffect(() => {
    console.log(securityHistory);
  }, [securityHistory]);

  return (
    <>
      <Grid container spacing={0}>
        <Grid container item xs={4} sx={{ flexDirection: 'row' }}>
          <Title>
            <div style={{ flexDirection: 'column' }}>
              {symbol}
              <span style={{ color: (profitLoss > 0) ? 'green' : 'red', paddingLeft: '10px' }}>
                {`(${formatPercentage(profitLoss, 2)})`}
              </span>
            </div>
          </Title>
        </Grid>
        <Grid container item spacing={1} justifyContent="flex-end" xs={8}>
          <Grid container item spacing={1} justifyContent="flex-end" xs={12}>
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
          <Grid container item spacing={1} justifyContent="flex-end" xs={12}>
            {
              availableViewModes.map((duration: ViewMode) => (
                <Grid item key={duration}>
                  <Button
                    href="#"
                    variant={viewMode === duration ? 'contained' : 'text'}
                    onClick={() => { setViewMode(duration); }}
                    sx={{ p: 0.25, m: 0, minWidth: 10 }}
                  >
                    {duration}
                  </Button>
                </Grid>
              ))
            }
          </Grid>
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
              {/* Price */}
            </Label>
          </YAxis>
          <ReferenceLine y={0} />
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
            // shape="triangle"
            shape={<TriangleShape r={16} angle={0} />}
            fill="green"
            legendType="triangle"
          />
          <Scatter
            isAnimationActive={false}
            name="Sell"
            dataKey="sell"
            shape={<TriangleShape r={16} angle={0} />}
            fill="red"
            legendType="triangle"
          />
          <Scatter
            isAnimationActive={false}
            name="Dividend"
            dataKey="dividend"
            shape="circle"
            fill="#8884D8"
            legendType="circle"
          />
          <Scatter
            isAnimationActive={false}
            name="Posting"
            dataKey="posting"
            shape={<TriangleShape r={16} angle={0} onlyRightIf="buy" />}
            fill="#B2FFBE"
            legendType="triangle"
          />
          <Scatter
            isAnimationActive={false}
            name="Vesting"
            dataKey="vesting"
            shape={<TriangleShape r={16} angle={0} />}
            fill="#FFB2B2"
            legendType="triangle"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ paddingLeft: 15 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}

Chart.defaultProps = {
  accountId: 0,
};

export { Chart };
