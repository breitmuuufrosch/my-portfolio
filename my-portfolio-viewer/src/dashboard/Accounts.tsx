import * as React from 'react';
import Link from '@mui/material/Link';
import { AccountSummary } from '@backend/types/account';
import { getAccountSummary } from '../types/service';
import { formatNumber } from '../data/formatting';
import { CustomColumn, CustomTable } from '../components/Table';

const columns: CustomColumn<AccountSummary>[] = [
  { id: 'name', label: 'Name' },
  { id: 'currency', label: 'Currency' },
  {
    id: 'balance',
    label: 'Balance',
    align: 'right',
    format: formatNumber,
  },
  {
    id: 'actions',
    label: 'Actions',
    components: [
      (item: AccountSummary) => (<Link href={`accounts/history?accountId=${item.id}`}>History</Link>),
    ],
  },
];

export function Accounts() {
  const [accountSummary, setAccountSummary] = React.useState<AccountSummary[] | null>(null);

  React.useEffect(() => {
    getAccountSummary().then(
      (result) => setAccountSummary(result),
    );
  }, []);

  return (
    <CustomTable
      columns={columns}
      data={accountSummary?.sort((a, b) => {
        if (a.name === b.name) {
          return a.currency.localeCompare(b.currency);
        }
        return a.name.localeCompare(b.name);
      })}
      dataKey="id"
      activeKey=""
      setActive={() => { }}
    />
  );
}
