import React from 'react';
import './App.css';
// import Button from '@mui/material/Button';
// import { DividendTotal, getDividends } from './types/dividends';
// import { Dashboard } from './dashboard/Dashboard';
import { Main } from './Main';

export function App() {
  // const [dividends, setDividends] = React.useState<DividendTotal | null>(null);
  // const dividends = await getDividends();

  // React.useEffect(() => {
  //   getDividends<DividendTotal>().then(
  //     (result) => setDividends(result),
  //   );
  // }, []);

  return (
    <div className="App">

      <Main />
    </div>
  );
}
