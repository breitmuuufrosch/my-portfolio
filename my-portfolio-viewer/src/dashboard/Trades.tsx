import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import { Trade } from '@backend/types/trade';
import { Chart } from './Chart';
import { getTrades } from '../types/service';
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
  const [trades, setTrades] = React.useState<TradesByAccount[] | null>(null);
  const [footer, setFooter] = React.useState<TradesByAccount[] | null>(null);

  React.useEffect(() => {
    getTrades().then(
      (newTrades) => {
        const byAccount = newTrades.map((item: Trade) => ({ ...item, dataKey: `${item.symbol}-${item.accountId}` }));
        setTrades(byAccount);

        setFooter(
          ['CHF', 'EUR', 'USD'].map((currency) => (
            byAccount
              .filter((row) => row.currency === currency)
              .reduce(
                (accumulator, row) => {
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
          )).map((trade: TradesByAccount) => {
            const updatedTrade: TradesByAccount = { ...trade };
            updatedTrade.profitLoss = trade.exitPrice - trade.entryPriceAll;
            updatedTrade.profitLossPercentage = 100 * (updatedTrade.profitLoss / trade.entryPriceAll);
            return updatedTrade;
          }),
        );
      },
    );
  }, []);

  React.useEffect(() => {
    if (selectSymbol) { selectSymbol(symbol, accountId); }
  }, [symbol, accountId]);

  return (
    <>
      <Grid container flexDirection="row" justifyContent="center">
        <Link href="#" onClick={() => selectSymbol('CHF', 0)}>CHF</Link>
        <Link href="#" onClick={() => selectSymbol('EUR', 0)}>EUR</Link>
        <Link href="#" onClick={() => selectSymbol('USD', 0)}>USD</Link>
      </Grid>
      <CustomTable
        maxHeight={window.innerHeight - 64 - 52 - 32 - 32 - 16 - 16 - 300 - 3 * 8 - 24}
        columns={columns}
        data={trades?.sort((a, b) => a.symbol.localeCompare(b.symbol))}
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
            console.log(symbolP, accountId); setSymbol(symbolP); setAccountId(accountIdP);
          }}
        />
      </Grid>
    </Grid>
  );
}

export { Trades };
