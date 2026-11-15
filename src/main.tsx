import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/theme.css';
import { applyBrandTheme, ACTIVE_BRAND_CONFIG } from './config/brandConfig';

// Initialize dynamic theme and title per SPEC-04
applyBrandTheme(ACTIVE_BRAND_CONFIG);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
