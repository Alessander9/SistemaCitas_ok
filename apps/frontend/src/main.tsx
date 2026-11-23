import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/dark-theme.css';
import { ThemeProvider } from './context/ThemeContext';
import { ClinicBrandingProvider } from './context/ClinicBrandingContext';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ClinicBrandingProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ClinicBrandingProvider>
    </ThemeProvider>
  </StrictMode>,
);

