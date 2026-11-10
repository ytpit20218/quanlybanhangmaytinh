// ==========================================
// COMPUTERTECH ROOT APPLICATION COMPONENT
// ==========================================

import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AppProvider } from '../state/AppContext';
import { AuthProvider } from '../state/AuthContext';
import { AppRoutes } from './routes';

// Tu dong nhan dien moi truong: Chay HashRouter tren GitHub Pages de khong bi loi 404 reload,
// va chay BrowserRouter o moi truong local dev / E2E test de giu nguyen routing chuan.
const isStaticOrGitHubPages =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
    window.location.protocol === 'file:' ||
    window.location.pathname.includes('/quanlybanhangmaytinh'));

const Router = isStaticOrGitHubPages ? HashRouter : BrowserRouter;

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
