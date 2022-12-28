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
import { SecurityQuote } from '@backend/types/security';
import { getSecurityQuotes } from 'src/types/service';
import { Title } from './Title';

function Chart(props: {
  symbol: string,
}) {
  const { symbol } = props;
  const theme = useTheme();

  const [dates] = React.useState<Date[]>([new Date(2022, 1, 1), new Date(2022, 12, 31)]);
  const [securityHistory, setSecurityHistory] = React.useState<SecurityQuote[] | null>(null);
  const [domain, setDomain] = React.useState<number[]>([0, 1]);

  React.useEffect(() => {
    console.log('chart', symbol);
    getSecurityQuotes(symbol).then(
      (result) => {
        setSecurityHistory(result);
        const closeValues = result.map((item) => item.close);
        const minValue = Math.min(...closeValues);
        const maxValue = Math.max(...closeValues);
        const range = maxValue - minValue;
        setDomain([minValue - (0.02 * range), maxValue + (0.02 * range)]);
      },
    );
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
            dataKey="close"
            stroke={theme.palette.primary.main}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

export { Chart };
