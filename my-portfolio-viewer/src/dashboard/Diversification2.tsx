import * as React from 'react';
import { Grid, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from 'recharts';
import { TradeDiversification } from '@backend/types/trade';
import { getDiversification } from 'src/types/service';
import { hexToHsl, hslToHex } from 'src/data/colors';
import { Title } from './Title';
import { formatNumber } from '../data/formatting';

function CustomTooltip({ active, payload }: any) {
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
        <Grid item>{payload[0].name}</Grid>
        <Grid item sx={{ pb: 2 }}>{`Value: ${formatNumber(payload[0].value)}`}</Grid>
        {
          payload[0].payload.positions.map((position: Position) => (
            <Grid item key={`${position.symbol}-${position.currency}`}>
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
  CURRENCY = 'currency',
}

function Chart() {
  const theme = useTheme();

  const [tradeDiversification, setTradeDiversification] = React.useState<TradeDiversification[] | null>(null);
  const [pieData, setPieData] = React.useState<PieItem[] | null>(null);
  const [pieDataDetails, setPieDataDetails] = React.useState<PieItem[] | null>(null);
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

  let COLORS: string[] = [];
  COLORS = [
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

  COLORS = ['#b30000', '#7c1158', '#4421af', '#1a53ff', '#0d88e6', '#00b7c7', '#5ad45a', '#8be04e', '#ebdc78'];
  COLORS = ['#e60049', '#0bb4ff', '#50e991', '#e6d800', '#9b19f5', '#ffa300', '#dc0ab4', '#b3d4ff', '#00bfa0'];

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
        output.push({
          label: item[viewMode],
          value: item.exitPrice,
          color: '',
          positions: [{
            symbol: item.symbol,
            name: item.name,
            value: item.exitPrice,
            currency: item.currency,
          }],
        });
      }
    });

    output.sort((a: PieItem, b: PieItem) => b.value - a.value);
    output.forEach((item) => {
      item.positions.sort((a: Position, b: Position) => b.value - a.value);
    });
    const colored = output.map((item, index) => ({ ...item, color: COLORS[index % COLORS.length] }));

    setPieData(colored);
    setPieDataDetails(
      colored?.reduce((prev, curr) => prev.concat(curr.positions.map((item, index) => {
        const newColor = hexToHsl(curr.color);
        newColor[2] += 0.1 + (index + 1) * ((0.7 - newColor[2]) / curr.positions.length);

        return {
          label: item.symbol,
          value: item.value,
          color: hslToHex(newColor),
          positions: [],
        };
      })), [] as PieItem[]),
    );
  };

  React.useEffect(() => {
    getDiversification().then(setTradeDiversification);
  }, []);

  React.useEffect(() => {
    updatePieData();
  }, [tradeDiversification, viewMode]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    data,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    if (data === null) {
      return (<text />);
    }
    const getPosition = (radius: number) => ({
      x: cx + radius * Math.cos(-midAngle * RADIAN),
      y: cy + radius * Math.sin(-midAngle * RADIAN),
    });
    const innerPos = getPosition(innerRadius + 0.5 * (outerRadius - innerRadius));
    const outerPos = getPosition(100 + 25 + innerRadius + (outerRadius - innerRadius));

    return (
      <>
        <text
          x={innerPos.x}
          y={innerPos.y}
          fill="white"
          textAnchor="middle"
          // textAnchor={innerPos.x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <text
          x={outerPos.x}
          y={outerPos.y - 10}
          fill={COLORS[index % COLORS.length]}
          textAnchor={outerPos.x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {data[index].label}
        </text>
        <text
          x={outerPos.x}
          y={outerPos.y + 10}
          fill={COLORS[index % COLORS.length]}
          textAnchor={outerPos.x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {`(${formatNumber(data[index].value)} / ${(percent * 100).toFixed(0)}%)`}
        </text>
      </>
    );
  };

  const renderCustomizedLabelInner = (props) => renderCustomizedLabel({ ...props, data: pieData });

  if (pieData === null || pieDataDetails === null) {
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
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={2000} height={600}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={200}
            label={renderCustomizedLabelInner}
          >
            {
              pieData.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.color}
                />
              ))
            }
          </Pie>
          <Pie
            data={pieDataDetails}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={200}
            outerRadius={300}
            label={false}
          >
            {
              pieDataDetails
                .map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={entry.color}
                  />
                ))
            }
            <Label
              value="Total"
              position="centerBottom"
              style={{ transform: 'translateY(-15px)' }}
            // style={styleCenterText}
            />
            <Label
              value={formatNumber(pieData.reduce((acc: number, curr: PieItem) => acc + curr.value, 0))}
              position="centerTop"
              style={styleCenterText}
            />
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

export { Chart as Diversification2 };
