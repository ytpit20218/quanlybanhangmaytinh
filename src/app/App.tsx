// ==========================================
// COMPUTERTECH ROOT APPLICATION COMPONENT
// ==========================================

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../state/AppContext';
import { AuthProvider } from '../state/AuthContext';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
