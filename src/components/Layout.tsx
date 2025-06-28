import { ReactNode } from 'react';
import { useTheme } from '@/lib/theme';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/AuthProvider';
import { useCurrency } from '@/features/currency/CurrencyProvider';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { Navigation, SkipLink } from '@/components/custom/navigation';
import { MobileNav, BottomNav } from '@/components/custom/mobile-nav';
import { TestUserSwitcher } from '@/components/TestUserSwitcher';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/import', label: 'Import' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/team/advanced', label: 'Team' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/settings', label: 'Settings' },
];

const mobileNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/import', label: 'Import' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/team/advanced', label: 'Team' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();
  const { signOut, user } = useAuth();
  const { userCurrency, setUserCurrency, availableCurrencies } = useCurrency();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`min-h-screen ${dark ? 'dark' : ''}`}>
      <SkipLink />
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-8">
            <span
              className={`font-extrabold text-2xl tracking-tight select-none ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}
            >
              SubTrack
            </span>
            <Navigation items={navigationItems} className="hidden md:flex" />
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile Navigation */}
            <MobileNav items={mobileNavItems} />

            {/* Test User Switcher */}
            <TestUserSwitcher />

            {/* Currency Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 focus-visible-ring hidden sm:flex"
                >
                  {userCurrency}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableCurrencies.map(currency => (
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="focus-visible-ring"
            >
              {dark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full w-10 h-10 p-0 focus-visible-ring"
                >
                  <span
                    className={`inline-block w-8 h-8 rounded-full ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav items={mobileNavItems.slice(0, 4)} />

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
