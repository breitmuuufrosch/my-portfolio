import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from 'recharts';
import { getPortfolioQuotes, getSecurityQuotes } from 'src/types/service';
import { Title } from './Title';

interface HistoryItem {
  date: Date,
  value: number,
}

const rounding = (value?: number): string => Math.round(value).toLocaleString('de-CH');

function Chart(props: {
  symbol: string,
}) {
  const { symbol } = props;
  const theme = useTheme();

  const [dates] = React.useState<Date[]>([new Date(2021, 1, 1), new Date(2022, 12, 31)]);
  const [securityHistory, setSecurityHistory] = React.useState<HistoryItem[] | null>(null);
  const [domain, setDomain] = React.useState<number[]>([0, 1]);

  React.useEffect(() => {
    console.log('chart', symbol);
    if (['CHF', 'EUR', 'USD'].includes(symbol)) {
      getPortfolioQuotes(symbol).then(
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
      getSecurityQuotes(symbol).then(
        (result) => {
          setSecurityHistory(result.map((item) => ({ date: item.date, value: item.close })));
          const closeValues = result.map((item) => item.close);
          const minValue = Math.min(...closeValues);
          const maxValue = Math.max(...closeValues);
          const range = maxValue - minValue;
          setDomain([minValue - (0.02 * range), maxValue + (0.02 * range)]);
        },
      );
    }
  }, [symbol]);

  return (
    <>
      <Title>{symbol}</Title>
      <ResponsiveContainer>
        <LineChart
          data={securityHistory}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
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
            tickFormatter={(value: string) => String(rounding(Number(value)))}
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
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

export { Chart };
