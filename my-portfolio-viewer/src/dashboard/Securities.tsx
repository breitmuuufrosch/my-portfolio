import * as React from 'react';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import { Security } from '@backend/types/security';
import { getSecurities } from '../types/service';
import { CustomColumn, CustomTable } from '../components/Table';

const columns: CustomColumn<Security>[] = [
  { id: 'symbol', label: 'Symbol' },
  { id: 'nameLong', label: 'Name' },
  { id: 'currency', label: 'Currency' },
  { id: 'isin', label: 'ISIN' },
  { id: 'holdings', label: 'Holdings' },
  {
    id: 'actions',
    label: 'Actions',
    components: [
      (item: Security) => (<Link href={`securities/history?securityId=${item.symbol}`}>History</Link>),
    ],
  },
];

export function Securities() {
  const [securities, setSecurities] = React.useState<Security[] | null>(null);

  React.useEffect(() => {
    getSecurities().then(
      (result) => setSecurities(result),
    );
  }, []);

  return (
    <Grid style={{ height: '100%' }}>
      <CustomTable
        columns={columns}
        data={securities?.sort((a, b) => a.symbol.localeCompare(b.symbol))}
        dataKey="id"
        activeKey=""
        setActive={() => { }}
      />
    </Grid>
  );
}
