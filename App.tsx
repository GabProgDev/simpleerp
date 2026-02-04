import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes';
import { Users, AlertTriangle } from 'lucide-react'; // Imports to ensure icons work if not tree-shaken, though used in sub-components

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;