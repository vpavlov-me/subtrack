import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface CurrencyRate {
  base: string
  target: string
  rate: number
  fetched_at: string
}

interface CurrencyContextType {
  // User's preferred currency
  userCurrency: string
  setUserCurrency: (currency: string) => void
  
  // Available currencies
  availableCurrencies: string[]
  
  // Conversion functions
  convert: (amount: number, fromCurrency: string, toCurrency: string) => number
  formatAmount: (amount: number, currency: string) => string
  
  // Rates data
  rates: CurrencyRate[]
  loading: boolean
  error: string | null
  
  // Refresh rates
  refreshRates: () => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'RUB']

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [userCurrency, setUserCurrency] = useState<string>('USD')
  const [rates, setRates] = useState<CurrencyRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user's preferred currency from profile
  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('base_currency')
            .eq('user_id', user.id)
            .single()
          
          if (profile?.base_currency) {
            setUserCurrency(profile.base_currency)
          }
        }
      } catch (err) {
        console.error('Failed to load user currency:', err)
      }
    }

    void loadUserCurrency()
  }, [])

  // Load currency rates
  useEffect(() => {
    const loadRates = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error: ratesError } = await supabase
          .from('currency_rates')
          .select('*')
          .order('base')
        
        if (ratesError) throw ratesError
        
        setRates(data || [])
      } catch (err) {
        console.error('Failed to load currency rates:', err)
        setError('Failed to load currency rates')
      } finally {
        setLoading(false)
      }
    }

    void loadRates()
  }, [])

  // Update user's preferred currency
  const updateUserCurrency = async (currency: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            base_currency: currency
          })
        
        setUserCurrency(currency)
      }
    } catch (err) {
      console.error('Failed to update user currency:', err)
    }
  }

  // Convert amount between currencies
  const convert = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount
    
    const rate = rates.find(r => r.base === fromCurrency && r.target === toCurrency)
    if (!rate) return amount // fallback to original amount
    
    return Number((amount * rate.rate).toFixed(2))
  }

  // Format amount with currency symbol
  const formatAmount = (amount: number, currency: string): string => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      RUB: '₽'
    }
    
    const symbol = currencySymbols[currency] || currency
    return `${symbol}${amount.toFixed(2)}`
  }

  // Refresh rates manually
  const refreshRates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Trigger edge function to refresh rates
      const { error: refreshError } = await supabase.functions.invoke('currency_rates_refresh')
      if (refreshError) throw refreshError
      
      // Reload rates
      const { data, error: ratesError } = await supabase
        .from('currency_rates')
        .select('*')
        .order('base')
      
      if (ratesError) throw ratesError
      
      setRates(data || [])
    } catch (err) {
      console.error('Failed to refresh rates:', err)
      setError('Failed to refresh currency rates')
    } finally {
      setLoading(false)
    }
  }

  const value: CurrencyContextType = {
    userCurrency,
    setUserCurrency: updateUserCurrency,
    availableCurrencies: DEFAULT_CURRENCIES,
    convert,
    formatAmount,
    rates,
    loading,
    error,
    refreshRates
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
} 