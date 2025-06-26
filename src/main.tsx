import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from '@/lib/theme'
import './index.css'
import { AuthKitProvider } from '@workos-inc/authkit-react'
import { SubscriptionsProvider } from '@/features/subscriptions/SubscriptionsProvider'
import { useSupabaseAuthSync } from '@/hooks/useSupabaseAuthSync'
import { Toaster } from 'sonner'
import { TeamsProvider } from '@/features/teams/TeamsProvider'
import { CurrencyProvider } from '@/features/currency/CurrencyProvider'

function AuthSync({ children }: { children: React.ReactNode }) {
  // Синхронизация токена в Supabase происходит уже внутри контекста AuthKit
  useSupabaseAuthSync()
  return <>{children}</>
}

function Providers({ children }: { children: React.ReactNode }) {
  // Fallback clientId, чтобы можно было запускать без настроек WorkOS
  const clientId = (import.meta.env.VITE_WORKOS_CLIENT_ID as string | undefined) ?? 'demo-client-id'

  return (
    <AuthKitProvider clientId={clientId} devMode>
      <AuthSync>
        <ThemeProvider>
          <SubscriptionsProvider>
            <TeamsProvider>
              <CurrencyProvider>
                {children}
              </CurrencyProvider>
            </TeamsProvider>
          </SubscriptionsProvider>
          <Toaster richColors position="top-right" ariaLive="assertive" />
        </ThemeProvider>
      </AuthSync>
    </AuthKitProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
)
