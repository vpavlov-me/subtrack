import { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '@/lib/theme'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@workos-inc/authkit-react'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/features/currency/CurrencyProvider'
import { FeedbackWidget } from '@/components/FeedbackWidget'

export default function Layout({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme()
  const { signOut } = useAuth()
  const { userCurrency, setUserCurrency, availableCurrencies } = useCurrency()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    signOut()
  }

  return (
    <div className={`min-h-screen ${dark ? 'dark' : ''}`}>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-8">
            <span className={`font-extrabold text-2xl tracking-tight select-none ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>SubTrack</span>
            <nav className="flex gap-6" aria-label="Primary navigation">
              <NavLink to="/dashboard" className={({isActive}) => isActive ? (dark ? 'font-bold text-zinc-100' : 'font-bold text-zinc-900') : (dark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 transition')}>Dashboard</NavLink>
              <NavLink to="/transactions" className={({isActive}) => isActive ? (dark ? 'font-bold text-zinc-100' : 'font-bold text-zinc-900') : (dark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 transition')}>Transactions</NavLink>
              <NavLink to="/settings" className={({isActive}) => isActive ? (dark ? 'font-bold text-zinc-100' : 'font-bold text-zinc-900') : (dark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 transition')}>Settings</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Currency Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  {userCurrency}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableCurrencies.map((currency) => (
                  <DropdownMenuItem
                    key={currency}
                    onClick={() => setUserCurrency(currency)}
                    className={userCurrency === currency ? 'bg-accent' : ''}
                  >
                    {currency}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0">
                  <span className={`inline-block w-8 h-8 rounded-full ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleSignOut}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  )
} 