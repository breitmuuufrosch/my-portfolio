import React from 'react';
import logo from './logo.svg';
import './App.css';
import { DividendTotal, getDividends } from './types/dividends';

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
      <div>
        { dividends?.all.map((d) => (
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
    </div>
  );
}

export default App;
