import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/lib/theme';
import './index.css';
import { SubscriptionsProvider } from '@/features/subscriptions/SubscriptionsProvider';
import { Toaster } from 'sonner';
import { TeamsProvider } from '@/features/teams/TeamsProvider';
import { CurrencyProvider } from '@/features/currency/CurrencyProvider';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SubscriptionsProvider>
        <TeamsProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </TeamsProvider>
      </SubscriptionsProvider>
      <Toaster richColors position="top-right" ariaLive="assertive" />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
