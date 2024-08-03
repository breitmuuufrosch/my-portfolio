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
  Legend,
} from 'recharts';
import { TradeDiversification } from '@backend/types/trade';
import { getDiversification } from 'src/types/service';
import {
  COLOR_SET3,
  hexToHsl,
  hexToRgb,
  hslToHex,
} from 'src/data/colors';
import { Title } from './Title';
import { formatNumber, formatPercentage } from '../data/formatting';

interface IPieItem {
  parent: IPieItem,
  children: IPieItem[],
  label: string,
  value: number,
  currency: string,
  valueDefault: number,
  currencyDefault: string,
  color: string,
  start: number,
  end: number,
  percentage: () => number,
  addChild: (item: IPieItem) => void,
  sort: () => void,
  setColor: (v: string) => void,
  setAngles: (s: number, e: number) => void,
}

const PieItem = (
  props: {
    parent: IPieItem,
    label: string,
    value: number,
    currency: string,
    valueDefault: number,
    currencyDefault: string,
    color: string,
  },
): IPieItem => {
  const {
    parent,
    label,
    color,
    value,
    currency,
    valueDefault,
    currencyDefault,
  } = props;
  const children = [];

  const sort = (): void => {
    children.sort((a: IPieItem, b: IPieItem) => b.value - a.value);
    children.forEach((item) => { item.sort(); });
    children.reduce((acc, curr: IPieItem) => {
      const e = acc + curr.percentage();
      curr.setAngles(acc, e);
      return e;
    }, 0);
  };

  const item = {
    parent,
    children,
    label,
    value,
    currency,
    valueDefault,
    currencyDefault,
    color,
    start: 0,
    end: 0,
    percentage: (): number => (item.parent ? item.value / item.parent.value : 1),
    addChild: (child: IPieItem): void => {
      item.value += child.value;
      item.valueDefault += child.valueDefault;
      item.children.push(child);

      let updateParent = item.parent;
      while (updateParent) {
        updateParent.value += child.value;
        updateParent.valueDefault += child.valueDefault;
        updateParent = updateParent.parent;
      }
    },
    sort,
    setColor: (v: string) => { item.color = v; },
    setAngles: (s: number, e: number) => { item.start = s; item.end = e; },
  };

  if (parent) {
    parent.addChild(item);
  }

  return item;
};

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const finalPositions: IPieItem[] = [];
    const overflowPosiitons: IPieItem[] = [];
    payload[0].payload.children?.forEach((item: IPieItem) => {
      if (finalPositions.length < 5) {
        finalPositions.push(item);
      } else {
        overflowPosiitons.push(item);
      }
    });

    const summary = ['CHF', 'EUR', 'USD'].map((currency: string) => (
      overflowPosiitons
        .filter((row) => row.currency === currency)
        .reduce((acc, row) => {
          acc.value += row.value;
          acc.valueDefault += row.valueDefault;
          return acc;
        }, PieItem({
          parent: undefined, label: currency, value: 0, currency, valueDefault: 0, currencyDefault: 'CHF', color: '',
        }))));

    finalPositions.push(...summary.filter((item) => item.value > 0));
    const weight = payload[0].payload.percentage() * 100;
    const totalWeight = payload[0].payload.percentage() * payload[0].payload.parent.percentage() * 100;

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
        <Grid item sx={{ pt: 1 }}>
          {
            `Value: ${formatNumber(payload[0].payload.value)} ${payload[0].payload.currency}`
          }
        </Grid>
        <Grid item sx={{ pt: 1 }}>
          {
            `Value (foreign): ${formatNumber(payload[0].payload.valueDefault)} ${payload[0].payload.currencyDefault}`
          }
        </Grid>
        <Grid item>{`Weight: ${formatPercentage(weight)}`}</Grid>
        <Grid item sx={{ pb: 1 }}>{`Total Weight: ${formatPercentage(totalWeight)}`}</Grid>
        {
          finalPositions.map((position: IPieItem) => (
            <Grid item key={`${position.label}-${position.currency}`}>
              {`${position.label} ${formatNumber(position.value)} ${position.currency}`}
            </Grid>
          ))
        }
      </Grid>
    );
  }

  return null;
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

// const sortPieItems = (items: PieItem[]) => {
//   items.sort((a: PieItem, b: PieItem) => b.value - a.value);
//   items.forEach((item: PieItem) => sortPieItems(item.children));
// }

function Chart() {
  const theme = useTheme();

  const [tradeDiversification, setTradeDiversification] = React.useState<TradeDiversification[] | null>(null);
  // const [pieData, setPieData] = React.useState<PieItem[] | null>(null);
  const [pieRoot, setPieRoot] = React.useState<IPieItem | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.QUOTE_TYPE);
  const [hoverKey, setHoverKey] = React.useState<string>('');

  const styleCenterText = { fontSize: 26, fill: theme.palette.text.secondary };

  const updatePieData = () => {
    if (tradeDiversification === null) {
      return;
    }

    const root = PieItem({
      parent: undefined, label: 'all', value: 0, currency: 'CHF', valueDefault: 0, currencyDefault: '-', color: '',
    });
    // const output: IPieItem[] = [];

    tradeDiversification.forEach((item: TradeDiversification) => {
      const value = item[viewMode];
      const groupValue = viewMode === ViewMode.ACCOUNT ? value.split('(')[0].trim() : value;
      if (value === null) {
        return;
      }
      const existing = root.children.filter((v) => v.label === groupValue);
      if (existing.length) {
        const existingIndex = root.children.indexOf(existing[0]);
        const parent = root.children[existingIndex];
        PieItem({
          parent,
          label: item.name,
          value: item.exitPriceDefault,
          currency: item.currencyDefault,
          valueDefault: item.exitPrice,
          currencyDefault: item.currency,
          color: '',
        });
      } else {
        const parent = PieItem({
          parent: root, label: groupValue, value: 0, currency: 'CHF', valueDefault: 0, currencyDefault: '', color: '',
        });
        PieItem({
          parent,
          label: item.name,
          value: item.exitPriceDefault,
          currency: item.currencyDefault,
          valueDefault: item.exitPrice,
          currencyDefault: item.currency,
          color: '',
        });
      }
    });

    root.sort();
    root.children.forEach((item, index) => {
      const color = COLOR_SET3[index % COLOR_SET3.length];
      item.setColor(color);

      item.children.forEach((child, childIndex) => {
        const newColor = hexToHsl(color);
        newColor[2] += 0.1 + (childIndex + 1) * ((0.7 - newColor[2]) / item.children.length);
        child.setColor(hslToHex(newColor));
      });
    });
    // const colored = output.map((item, index) => {
    //   const color = COLOR_SET3[index % COLOR_SET3.length];

    //   return {
    //     ...item,
    //     color,
    //     children: item.children.map((child, childIndex) => {
    //       const newColor = hexToHsl(color);
    //       newColor[2] += 0.1 + (childIndex + 1) * ((0.7 - newColor[2]) / item.children.length);

    //       return {
    //         ...child,
    //         color: hslToHex(newColor),
    //       };
    //     }),
    //   };
    // });

    // colored.forEach((item) => {
    //   const newItem = { ...item, parent: root };
    //   root.value += newItem.value;
    //   root.children.push(newItem);
    // });

    // const coloredDetails = colored?.reduce((prev, curr) => prev.concat(curr.children), [] as PieItem[]);

    // setPieData(colored);
    setPieRoot(root);
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
    const labelOffset = pieRoot?.children.reduce((prev, curr) => prev.concat(curr?.children), [] as IPieItem[]).length
      ? 75 : 0;
    const getPosition = (radius: number) => ({
      x: cx + radius * Math.cos(-midAngle * RADIAN),
      y: cy + radius * Math.sin(-midAngle * RADIAN),
    });
    const innerPos = getPosition(innerRadius + 0.5 * (outerRadius - innerRadius));
    // const outerPos = getPosition(labelOffset + 25 + innerRadius + (outerRadius - innerRadius));

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + labelOffset + 30) * cos;
    const my = cy + (outerRadius + labelOffset + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const outerPos = { x: ex, y: ey };
    const leftRight = cos >= 0 ? 1 : -1;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    const hex = data[index].color;
    const rgb = hexToRgb(hex);
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

    return (
      <>
        <text
          x={innerPos.x}
          y={innerPos.y}
          fill={luminance < 0.5 ? 'white' : 'black'}
          textAnchor="middle"
          // textAnchor={innerPos.x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          style={{ pointerEvents: 'none' }}
        >
          {`${formatPercentage(percent * 100, 2)}`}
        </text>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={hex} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={hex} stroke="none" />
        <text
          x={ex + leftRight * 12}
          y={outerPos.y}
          // fill={COLORS[index % COLORS.length]}
          fill={hex}
          textAnchor={textAnchor}
          dominantBaseline="central"
        >
          {data[index].label}
        </text>
        {/* <text
          x={ex + leftRight * 12}
          y={outerPos.y}
          dy={18}
          // fill={COLORS[index % COLORS.length]}
          fill={data[index].color}
          textAnchor={textAnchor}
          dominantBaseline="central"
        >
          {`(${formatNumber(data[index].value)} / ${(percent * 100).toFixed(0)}%)`}
        </text> */}
      </>
    );
  };

  const renderCustomizedLabelInner = (props) => renderCustomizedLabel({ ...props, data: pieRoot.children });

  // const renderLegend = (props: any) => {
  //   console.log(props);
  //   const { payload } = props;

  //   return (
  //     <ul>
  //       {
  //         payload.map((entry) => (
  //           <li key={`item-${entry.value}`}>{entry.value}</li>
  //         ))
  //       }
  //     </ul>
  //   );
  // };

  // renderLegend.propTypes = {
  //   payload: propTypes.any,
  // };

  const handleLegendMouseEnter = (e) => {
    console.log(e);
    setHoverKey(e.id);
    // if (!barProps[e.dataKey]) {
    //   setBarProps({ ...barProps, hover: e.dataKey });
    // }
  };

  const handleLegendMouseLeave = (e) => {
    console.log(e);
    setHoverKey(null);
    // setBarProps({ ...barProps, hover: null });
  };

  if (pieRoot === null) {
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
            data={pieRoot?.children}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={175}
            label={renderCustomizedLabelInner}
            onClick={(_, index) => {
              if (pieRoot.children[index].children.length) {
                setPieRoot(pieRoot.children[index]);
              }
            }}
          >
            {
              pieRoot?.children.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.color}
                  fillOpacity={Number(hoverKey === entry.label || !hoverKey ? 1 : 0.4)}
                />
              ))
            }
            <Label
              value="Total"
              position="centerBottom"
              style={{ transform: 'translateY(-15px)', userSelect: 'none' }}
              pointerEvents="none"
            // style={styleCenterText}
            />
            <Label
              value={
                formatNumber(pieRoot.children?.reduce((acc: number, curr: IPieItem) => acc + curr.value, 0))
              }
              position="centerTop"
              style={{ ...styleCenterText, userSelect: 'none' }}
              onClick={() => {
                if (pieRoot.parent) {
                  setPieRoot(pieRoot.parent);
                }
              }}
            />
          </Pie>
          {
            pieRoot?.children.map((item) => (
              <Pie
                key={item.label}
                data={item.children}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={175}
                outerRadius={250}
                label={false}
                startAngle={item.start * 360}
                endAngle={item.end * 360}
              >
                {
                  item.children.map((entry) => (
                    <Cell
                      key={entry.label}
                      fill={entry.color}
                      fillOpacity={Number(hoverKey === item.label || !hoverKey ? 1 : 0.4)}
                    />
                  ))
                }
              </Pie>
            ))
          }
          {/* <Pie
            data={pieRoot?.children.reduce((prev, curr) => prev.concat(curr?.children), [] as IPieItem[]) ?? null}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={175}
            outerRadius={250}
            label={false}
          >
            {
              pieRoot?.children
                .reduce((prev, curr) => prev.concat(curr?.children), [] as IPieItem[])
                .map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={entry.color}
                  />
                ))
            }
          </Pie> */}
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            // content={renderLegend}
            payload={
              pieRoot?.children.map((entry) => ({
                value: `${entry.label} (${formatPercentage(entry.percentage() * 100)})`,
                type: 'square',
                id: entry.label,
                color: entry.color,
              }))
            }
            onMouseOver={handleLegendMouseEnter}
            onMouseOut={handleLegendMouseLeave}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

export { Chart as Diversification };
