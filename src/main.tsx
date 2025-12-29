import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@cloudscape-design/global-styles/index.css';
import '@/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="light" defaultDensity="comfortable">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
