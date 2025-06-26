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
  const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID
  
  if (!clientId) {
    console.error('VITE_WORKOS_CLIENT_ID is required')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Configuration Error</h2>
          <p className="text-gray-600">VITE_WORKOS_CLIENT_ID environment variable is required</p>
        </div>
      </div>
    )
  }

  return (
    <AuthKitProvider clientId={clientId} devMode={import.meta.env.DEV}>
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
