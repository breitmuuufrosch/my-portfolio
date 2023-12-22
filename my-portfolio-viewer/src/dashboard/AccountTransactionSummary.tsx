import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountTransactionSummary } from '@backend/types/account';
import { getAccountTransactions } from '../types/service';
import { formatDate, formatNumber } from '../data/formatting';
import { CustomColumn, CustomTable } from '../components/Table';

interface AccountTransactionSummaryCum extends AccountTransactionSummary {
  cumsum: number,
}

const columns: CustomColumn<AccountTransactionSummaryCum>[] = [
  {
    id: 'date',
    label: 'Date',
    align: 'left',
    format: formatDate,
  },
  { id: 'type', label: 'Action' },
  { id: 'nameShort', label: 'Security' },
  {
    id: 'total',
    label: 'Value',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'cumsum',
    label: 'Cumulative Sum',
    align: 'right',
    format: formatNumber,
  },
];

export function AccountTransactionSummaryView() {
  const [searchParams] = useSearchParams();

  const [accountSummary, setAccountSummary] = React.useState<AccountTransactionSummaryCum[] | null>(null);

  React.useEffect(() => {
    getAccountTransactions(Number(searchParams.get('accountId'))).then(
      (result) => {
        let cumsum = 0;

        setAccountSummary(
          result
            .map((item) => ({ ...item, date: new Date(item.date) }))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((item) => {
              cumsum += Number(item.total);
              return { ...item, cumsum };
            })
            .reverse(),
        );
      },
    );
  }, []);

  return (
    <CustomTable
      columns={columns}
      data={accountSummary}
      dataKey="id"
      activeKey=""
      setActive={() => { }}
    />
  );
}
