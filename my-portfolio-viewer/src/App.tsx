import React from 'react';
import './App.css';
import Button from '@mui/material/Button';
import { DividendTotal, getDividends } from './types/dividends';
import Dashboard from './dashboard/Dashboard';

function App() {
  const [dividends, setDividends] = React.useState<DividendTotal | null>(null);
  // const dividends = await getDividends();

  React.useEffect(() => {
    getDividends<DividendTotal>().then(
      (result) => setDividends(result),
    );
  }, []);

  return (
    <div className="App">
      <Dashboard />
      <div>
        {dividends?.all.map((d) => (
          <li key={d.symbol}>
            {d.symbol}
            {' '}
            =
            {' '}
            {d.total}
          </li>
        ))}
      </div>
      <div>
        Total:
        {' '}
        {(Math.round((dividends?.total ?? 0) * 100) / 100).toFixed(2)}
      </div>
      <Button>Test</Button>
    </div>
  );
}

export default App;
