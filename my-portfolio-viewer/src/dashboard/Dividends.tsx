import * as React from 'react';
import Link from '@mui/material/Link';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { SecurityTransaction, SecurityTransactionType } from '@backend/types/security';
import { getAccountTransactionsByType, getDividends } from '../types/service';
import { formatNumber } from '../data/formatting';

function range(low: number, high: number) {
  const values = [];
  for (let i: number = low; i <= high; i += 1) {
    values.push(i);
  }
  return values;
}

interface DividendSummary {
  date: string,
  dateView: string,
  dividends: SecurityTransaction[],
}

const groupByDate = (array: SecurityTransaction[]) => array.reduce((results, item) => {
  const itemDate = new Date(item.date);
  const current = results.find((i) => i.date === `${itemDate.getFullYear()}-${itemDate.getMonth()}`);
  if (current) {
    current.dividends.push(item);
  } else {
    results.push({
      date: `${itemDate.getFullYear()}-${itemDate.getMonth()}`,
      dateView: `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}`,
      dividends: [item],
    });
  }
  return results;
}, []);

const data = [
  { queries: ['dividend'], property: 'value', text: 'dividend' },
  { queries: ['interest'], property: 'value', text: 'interest' },
  { queries: ['dividend', 'interest'], property: 'value', text: 'income' },
  { queries: ['dividend'], property: 'total', text: 'dividend (taxed)' },
  { queries: ['interest'], property: 'total', text: 'interest (taxed)' },
  { queries: ['dividend', 'interest'], property: 'total', text: 'income (taxed)' },
  { queries: ['payment'], property: 'total', text: 'payments' },
  { queries: ['payout'], property: 'total', text: 'payout' },
  { queries: ['buy'], property: 'total', text: 'invested' },
  { queries: [''], property: 'fee', text: 'fee' },
  { queries: [''], property: 'tax', text: 'tax' },
  { queries: ['planned'], property: 'total', text: 'dividend (planned)' },
];

export function Dividends() {
  const [types, setTypes] = React.useState<string[]>(['dividend']);
  const [prop, setProp] = React.useState<string>('value');
  const [transactions, setTransactions] = React.useState<DividendSummary[] | null>(null);
  const [dateRange, setDateRange] = React.useState<number[]>(null);

  const updateTransactions = (newTransactions: SecurityTransaction[]) => {
    const closeValues = newTransactions.map((item) => new Date(item.date));
    const minValue = new Date(Math.min.apply(null, closeValues));
    const maxValue = new Date(Math.max.apply(null, closeValues));
    setDateRange(range(minValue.getFullYear(), maxValue.getFullYear()));

    const g = groupByDate(newTransactions);
    console.log(g);
    console.log(g.find((i) => i.date === `${2023}-${2}`)?.dividends.filter((d) => d.currency === 'USD'));
    setTransactions(groupByDate(newTransactions));
  };

  React.useEffect(() => {
    if (types[0] === 'planned') {
      getDividends()
        .then((result) => {
          const newTransactions = result.filter((item) => item.payDividendDate).map((item) => ({
            securityId: 0,
            symbol: item.symbol,
            date: new Date(item.payDividendDate),
            type: 'dividend' as SecurityTransactionType,
            accountId: 0,
            currency: item.currency,
            price: item.total,
            amount: 0,
            total: item.total,
            value: item.total,
            fee: 0,
            tax: 0,
          }));
          updateTransactions(newTransactions.filter((d) => d.date > new Date()));
        });
    } else {
      const promises = types.map((type) => getAccountTransactionsByType(type));

      Promise.all(promises)
        .then((results) => {
          updateTransactions([].concat(...results));
        });
    }
  }, [types]);

  const renderYear = (currency: string, year: number) => (
    <TableRow key={`${currency}-${year}`}>
      <TableCell>{year}</TableCell>
      {
        range(0, 11).map((month) => (
          <TableCell key={`${currency}-${year}-${month}`} align="right">
            {
              formatNumber(
                transactions.find((i) => i.date === `${year}-${month}`)?.dividends
                  .filter((d) => d.currency === currency)
                  .reduce((result, d) => result + Number(d[prop]), 0),
              )
            }
          </TableCell>
        ))
      }
      <TableCell align="right">
        {
          formatNumber(
            transactions.filter((i) => i.date.startsWith(String(year)))
              .reduce((rm, dm) => rm + dm.dividends
                .filter((d) => d.currency === currency).reduce((r, d) => r + Number(d[prop]), 0), 0),
          )
        }
      </TableCell>
    </TableRow>
  );

  const renderCurrency = (currency: string) => (
    <>
      <h3>{currency}</h3>
      <Table size="small" style={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            {range(0, 11).map((month) => (
              <TableCell key={month} align="right">
                {new Date(2000, month).toLocaleString('default', { month: 'short' })}
              </TableCell>
            ))}
            <TableCell align="right">Tot</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            (dateRange !== null)
              ? dateRange.map((year) => renderYear(currency, year))
              : null
          }
        </TableBody>
      </Table>
    </>
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {
          data.map((d) => (
            <Box key={d.text} sx={{ pl: 1, pr: 1 }}>
              <Link href="#" onClick={() => { setTypes(d.queries); setProp(d.property); }}>{d.text}</Link>
            </Box>
          ))
        }
      </Box>
      {renderCurrency('CHF')}
      {renderCurrency('EUR')}
      {renderCurrency('USD')}
      {
        types[0] === 'planned' && transactions && transactions
          .sort((a: DividendSummary, b: DividendSummary) => {
            const aDate = a.date.split('-');
            const bDate = b.date.split('-');
            const { aYear, aMonth } = { aYear: Number(aDate[0]), aMonth: Number(aDate[1]) };
            const { bYear, bMonth } = { bYear: Number(bDate[0]), bMonth: Number(bDate[1]) };

            if (aYear === bYear) {
              return aMonth - bMonth;
            }
            return aYear - bYear;
          })
          .map((t) => (
            <>
              <h3>{t.dateView}</h3>
              <div>
                {
                  t.dividends.filter((d) => d.total > 0).map((d) => (
                    `${d.symbol} (${formatNumber(d.total)}), `
                  ))
                }
              </div>
            </>
          ))
      }
    </>
  );
}
