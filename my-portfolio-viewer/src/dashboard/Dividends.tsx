import * as React from 'react';
import Link from '@mui/material/Link';
import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { SecurityTransaction } from '@backend/types/security';
import { Title } from './Title';
import { getSecurityTransactionDetails } from '../types/service';

function range(low: number, high: number) {
  const values = [];
  for (let i: number = low; i <= high; i += 1) {
    values.push(i);
  }
  return values;
}

const rounding = (value?: number) => (value ? Math.round(value * 1000) / 1000 : 0);

interface DividendSummary {
  date: string,
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
      dividends: [item],
    });
  }
  return results;
}, []);

const data = [
  { queries: ['dividend'], property: 'value', text: 'dividend' },
  { queries: ['interest'], property: 'value', text: 'interest' },
  { queries: ['dividend', 'interest'], property: 'value', text: 'income' },
  { queries: [''], property: 'fee', text: 'fee' },
  { queries: [''], property: 'tax', text: 'tax' },
];

export function Dividends() {
  const [types, setTypes] = React.useState<string[]>(['dividend']);
  const [prop, setProp] = React.useState<string>('total');
  const [transactions, setTransactions] = React.useState<DividendSummary[] | null>(null);
  const [dateRange, setDateRange] = React.useState<number[]>(null);

  const updateTransactions = (newTransactions: SecurityTransaction[]) => {
    const closeValues = newTransactions.map((item) => new Date(item.date));
    const minValue = new Date(Math.min.apply(null, closeValues));
    const maxValue = new Date();
    setDateRange(range(minValue.getFullYear(), maxValue.getFullYear()));

    setTransactions(groupByDate(newTransactions));
  };

  React.useEffect(() => {
    const promises = types.map((type) => getSecurityTransactionDetails(type));

    Promise.all(promises)
      .then((results) => {
        updateTransactions([].concat(...results));
      });
  }, [types]);

  const renderYear = (currency: string, year: number) => (
    <TableRow key={`${currency}-${year}`}>
      <TableCell>{year}</TableCell>
      {
        range(0, 11).map((month) => (
          <TableCell key={`${currency}-${year}-${month}`}>
            {
              rounding(
                transactions.find((i) => i.date === `${year}-${month}`)?.dividends
                  .filter((d) => d.currency === currency)
                  .reduce((result, d) => result + Number(d[prop]), 0),
              )
            }
          </TableCell>
        ))
      }
      <TableCell>
        {
          rounding(
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
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            {range(0, 11).map((month) => (
              <TableCell key={month}>
                {new Date(2000, month).toLocaleString('default', { month: 'short' })}
              </TableCell>
            ))}
            <TableCell>Tot</TableCell>
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
      <Title>Dividends</Title>
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
    </>
  );
}
