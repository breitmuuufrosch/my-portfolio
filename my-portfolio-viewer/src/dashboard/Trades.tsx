import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import { Trade } from '@backend/types/trade';
import { Depot } from '@backend/types/account';
import { Chart } from './Chart';
import { getDepots, getTrades } from '../types/service';
import { formatDate, formatNumber, formatPercentage } from '../data/formatting';
import { CustomColumn, CustomTable } from '../components/Table';

interface TradesProps {
  selectSymbol?: (symbol: string, accountId: number) => void,
}

interface TradesByAccount extends Trade {
  dataKey: string,
}

const styleStickyHeaderColumn = {
  position: 'sticky',
  left: 0,
  // boxShadow: '5px 2px 5px grey',
  // borderRight: '2px solid black',
  zIndex: 11,
  bgcolor: 'background.paper',
};
const styleStickyColumn = { ...styleStickyHeaderColumn, zIndex: 10 };

const columns: CustomColumn<TradesByAccount>[] = [
  {
    id: 'name',
    label: 'Name',
    align: 'left',
    sxHeader: styleStickyHeaderColumn,
    sxBody: styleStickyColumn,
  },
  { id: 'symbol', label: 'Label' },
  { id: 'amount', label: 'Amount' },
  { id: 'currency', label: 'Currency' },
  {
    id: 'profitLoss',
    label: 'P/L',
    align: 'right',
    format: formatNumber,
    style: (trade: TradesByAccount) => ({ color: (trade.profitLoss > 0) ? 'green' : 'red' }),
  },
  {
    id: 'profitLossPercentage',
    label: 'P/L (%)',
    align: 'right',
    format: formatPercentage,
    style: (trade: TradesByAccount) => ({ color: (trade.profitLoss > 0) ? 'green' : 'red' }),
  },
  {
    id: 'buyPrice',
    label: 'Buy price',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'buyPriceAll',
    label: 'Buy price (all)',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'entryPrice',
    label: 'Entry price',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'entryPriceAll',
    label: 'Entry price (all)',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'exitPrice',
    label: 'Exit price',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'lastPrice',
    label: 'Last Price',
    align: 'right',
    format: formatNumber,
  },
  { id: 'lastDate', label: 'Last Date', format: formatDate },
];
const footerColumns = [
  'name', 'currency', 'profitLoss', 'profitLossPercentage', 'entryPrice', 'entryPriceAll', 'exitPrice',
];

function TradesList({ selectSymbol }: TradesProps) {
  // const { selectSymbol } = props;
  const [symbol, setSymbol] = React.useState<string>('LOGN.SW');
  const [accountId, setAccountId] = React.useState<number>(0);
  const [currencyId, setCurrencyId] = React.useState<string>('');
  const [depotId, setDepotId] = React.useState<number>(0);
  const [depots, setDepots] = React.useState<Depot[]>(null);
  const [trades, setTrades] = React.useState<TradesByAccount[] | null>(null);
  const [filteredTrades, setFilteredTrades] = React.useState<TradesByAccount[] | null>(null);
  const [footer, setFooter] = React.useState<TradesByAccount[] | null>(null);

  React.useEffect(() => {
    getTrades().then(
      (newTrades) => {
        setTrades(newTrades.map((item: Trade) => ({ ...item, dataKey: `${item.symbol}-${item.accountId}` })));
      },
    );

    getDepots().then(setDepots);
  }, []);

  React.useEffect(() => {
    if (trades === null) {
      return;
    }
    const newFilteredTrades = trades.filter((t) => (
      (depotId <= 0 || t.depotId === depotId) && (currencyId === '' || t.currency === currencyId) && t.amount > 0
    ));
    // const firstTrade = newFilteredTrades[0];
    // setSymbol(firstTrade.symbol);
    // selectSymbol(firstTrade.symbol, firstTrade.accountId);
    setFilteredTrades(newFilteredTrades);
    setFooter(
      ['CHF', 'EUR', 'USD', 'GBP'].map((currency) => (
        newFilteredTrades
          .filter((row) => row.currency === currency)
          .reduce(
            (accumulator, row) => {
              accumulator.buyPrice += row.buyPrice;
              accumulator.entryPrice += row.entryPrice;
              accumulator.entryPriceAll += row.entryPriceAll;
              accumulator.exitPrice += row.exitPrice;
              return accumulator;
            },
            {
              accountId: 0,
              name: 'Total',
              symbol: currency,
              quoteType: '',
              currency,
              buyPrice: 0,
              entryPrice: 0,
              entryPriceAll: 0,
              amount: null,
              exitPrice: 0,
              lastPrice: 0,
              lastDate: null,
              profitLoss: 0,
              profitLossPercentage: 0,
            } as TradesByAccount,
          )
      )).filter((trade: TradesByAccount) => trade.entryPrice > 0)
        .map((trade: TradesByAccount) => {
          const updatedTrade: TradesByAccount = { ...trade };
          updatedTrade.profitLoss = trade.exitPrice - trade.entryPriceAll;
          updatedTrade.profitLossPercentage = 100 * (updatedTrade.profitLoss / trade.entryPriceAll);
          return updatedTrade;
        }),
    );
  }, [trades, depotId, currencyId]);

  React.useEffect(() => {
    if (selectSymbol) { selectSymbol(symbol, accountId); }
  }, [symbol, accountId]);

  const currencySummary = (currency: string) => {
    selectSymbol(currency, 0);
    setCurrencyId(currency);
  };

  return (
    <>
      <Grid container flexDirection="row" justifyContent="center" spacing={1}>
        <Grid item>
          <Link href="#" onClick={() => currencySummary('CHF')}>CHF</Link>
        </Grid>
        <Grid item>
          <Link href="#" onClick={() => currencySummary('EUR')}>EUR</Link>
        </Grid>
        <Grid item>
          <Link href="#" onClick={() => currencySummary('USD')}>USD</Link>
        </Grid>
        <Grid item>
          <Link href="#" onClick={() => currencySummary('GBP')}>GBP</Link>
        </Grid>
        <Grid item>
          <Link href="#" onClick={() => currencySummary('')}>All</Link>
        </Grid>
        {
          depots?.map((a) => (
            <Grid item key={a.id}>
              <Link href="#" onClick={() => setDepotId(a.id)}>{a.name}</Link>
            </Grid>
          ))
        }
        <Grid item>
          <Link href="#" onClick={() => setDepotId(0)}>All</Link>
        </Grid>
      </Grid>
      <CustomTable
        maxHeight={window.innerHeight - 64 - 52 - 32 - 32 - 16 - 16 - 300 - 3 * 8 - 24}
        columns={columns}
        data={filteredTrades?.sort((a, b) => a.symbol.localeCompare(b.symbol))}
        footerColumns={footerColumns}
        footerData={footer}
        dataKey="dataKey"
        activeKey={`${symbol}-${accountId}`}
        setActive={(item) => { setSymbol(item.symbol); setAccountId(item.accountId); }}
      />
    </>
  );
}

TradesList.defaultProps = {
  selectSymbol: () => { },
};

function Trades() {
  const [symbol, setSymbol] = React.useState('LOGN.SW');
  const [accountId, setAccountId] = React.useState(0);

  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={12}
        sx={{
          // position: '-webkit-sticky',
          position: 'sticky',
          top: 30,
        }}
      >
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 300,
          }}
        >
          <Chart symbol={symbol} accountId={accountId} />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <TradesList
          selectSymbol={(symbolP: string, accountIdP: number) => {
            setSymbol(symbolP); setAccountId(accountIdP);
          }}
        />
      </Grid>
    </Grid>
  );
}

export { Trades };
