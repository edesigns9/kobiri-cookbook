import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MarketListProvider } from './contexts/MarketListContext';

// Create a root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Render the app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <MarketListProvider>
          <App />
        </MarketListProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);