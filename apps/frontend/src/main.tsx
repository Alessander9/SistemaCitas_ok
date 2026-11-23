import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/dark-theme.css';
import { ThemeProvider } from './context/ThemeContext';
import { ClinicBrandingProvider } from './context/ClinicBrandingContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ClinicBrandingProvider>
        <App />
      </ClinicBrandingProvider>
    </ThemeProvider>
  </StrictMode>,
);
