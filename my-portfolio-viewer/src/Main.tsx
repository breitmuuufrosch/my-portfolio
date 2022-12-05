import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import { Dashboard } from './dashboard/Dashboard';
import { Dashboard as Dashboard2 } from './dashboard/Dashboard2';

function Main() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/something" element={<Dashboard2 />} />
    </Routes>
  );
}

export { Main };
