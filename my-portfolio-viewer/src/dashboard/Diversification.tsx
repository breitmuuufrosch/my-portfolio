import * as React from 'react';
import { Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TradeDiversification } from '@backend/types/trade';
import { getDiversification } from 'src/types/service';
import { Title } from './Title';
import { formatNumber } from '../data/formatting';

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    console.log(payload[0]);
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
        <Grid item>{payload[0].name}</Grid>
        <Grid item sx={{ pb: 2 }}>{`Value: ${formatNumber(payload[0].value)}`}</Grid>
        {
          payload[0].payload.positions.map((position: Position) => (
            <Grid item key={position.symbol}>
              {`${position.name} ${formatNumber(position.value)} ${position.currency}`}
            </Grid>
          ))
        }
      </Grid>
    );
  }

  return null;
}

interface Position {
  name: string,
  symbol: string
  value: number,
  currency: string,
}

interface PieItem {
  label: string,
  value: number,
  color: string,
  positions: Position[],
}

enum ViewMode {
  QUOTE_TYPE = 'quoteType',
  SECTOR = 'sector',
  INDUSTRY = 'industry',
  REAL_ESTATE = 'realEstate',
  ACCOUNT = 'account',
  DEPOT = 'depot',
}

function Chart() {
  const theme = useTheme();

  const [tradeDiversification, setTradeDiversification] = React.useState<TradeDiversification[] | null>(null);
  const [pieData, setPieData] = React.useState<PieItem[] | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.QUOTE_TYPE);

  const styleCenterText = { fontSize: 26, fill: theme.palette.text.secondary };

  // const COLORS = [
  //   '#003f5c',
  //   '#2f4b7c',
  //   '#665191',
  //   '#a05195',
  //   '#d45087',
  //   '#f95d6a',
  //   '#ff7c43',
  //   '#ffa600',
  // ];

  const COLORS = [
    '#ff0000',
    '#ff8000',
    '#ffff00',
    '#80ff00',
    '#00ff00',
    '#00ff80',
    '#00ffff',
    '#0080ff',
    '#0000ff',
    '#8000ff',
    '#ff00ff',
    '#ff0080',
  ];

  const updatePieData = () => {
    if (tradeDiversification === null) {
      return;
    }

    const output: PieItem[] = [];

    tradeDiversification.forEach((item: TradeDiversification) => {
      if (item[viewMode] === null) {
        return;
      }
      const existing = output.filter((v) => v.label === item[viewMode]);
      if (existing.length) {
        const existingIndex = output.indexOf(existing[0]);
        output[existingIndex].value += item.exitPrice;
        output[existingIndex].positions.push({
          symbol: item.symbol,
          name: item.name,
          value: item.exitPrice,
          currency: item.currency,
        });
      } else {
        console.log(Math.floor(Math.random() * 16777215).toString(16));
        output.push({
          label: item[viewMode],
          value: item.exitPrice,
          color: Math.floor(Math.random() * 16777215).toString(16),
          positions: [{
            symbol: item.symbol,
            name: item.name,
            value: item.exitPrice,
            currency: item.currency,
          }],
        });
      }
    });

    output.sort((a: PieItem, b: PieItem) => a.value - b.value);
    output.forEach((item) => {
      item.positions.sort((a: Position, b: Position) => b.value - a.value);
    });

    setPieData(output);
    console.log(output.reduce((a, c) => a + c.value, 0));
  };

  React.useEffect(() => {
    getDiversification().then(setTradeDiversification);
  }, []);

  React.useEffect(() => {
    updatePieData();
  }, [tradeDiversification, viewMode]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    if (pieData === null) {
      return (<text />);
    }
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    // const radius = innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <>
        <text
          x={x}
          y={y - 10}
          fill={COLORS[index % COLORS.length]}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {pieData[index].label}
        </text>
        <text
          x={x}
          y={y + 10}
          fill={COLORS[index % COLORS.length]}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {`(${formatNumber(pieData[index].value)} / ${(percent * 100).toFixed(0)}%)`}
        </text>
      </>
    );
  };

  console.log(pieData);

  if (pieData === null) {
    return (null);
  }

  return (
    <>
      <Grid container spacing={0}>
        <Grid container item xs={4} sx={{ flexDirection: 'row' }}>
          <Title>{viewMode}</Title>
        </Grid>
        <Grid container item spacing={1} justifyContent="flex-end" xs={8}>
          <Grid container item spacing={1} justifyContent="flex-end" xs={12}>
            {
              Object.values(ViewMode).map((duration: ViewMode) => (
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
        <>
          {/* <ComposedChart
          data={tradeDiversification}
          margin={{
            top: 16,
            right: 0,
            bottom: 0,
            left: 24,
          }}
        > */}
          <PieChart width={1000} height={750}>
            {/* <Legend layout="vertical" verticalAlign="bottom" align="center" /> */}
            {/* <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ paddingLeft: 15 }} /> */}
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={150}
              outerRadius={250}
              label={renderCustomizedLabel}
            >
              {
                pieData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={COLORS[index % COLORS.length]}
                  // fill={`#${entry.color}`}
                  />
                ))
              }
            </Pie>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={150}
              outerRadius={250}
              label={renderCustomizedLabel}
            >
              {
                pieData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={COLORS[index % COLORS.length]}
                  // fill={`#${entry.color}`}
                  />
                ))
              }
            </Pie>
            <text x={1000 / 2} y={750 / 2 - 30} textAnchor="middle" dominantBaseline="middle" style={styleCenterText}>
              Total
            </text>
            <text x={1000 / 2} y={750 / 2} textAnchor="middle" dominantBaseline="middle" style={styleCenterText}>
              {formatNumber(pieData.reduce((acc: number, curr: PieItem) => acc + curr.value, 0))}
            </text>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          </PieChart>
        </>
        {/* </ComposedChart> */}
      </ResponsiveContainer>
    </>
  );
}

export { Chart as Diversification };
