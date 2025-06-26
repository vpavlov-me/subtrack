import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'
import { Sun, Moon } from 'lucide-react'

export default function MarketingHeader() {
  const { dark, toggle } = useTheme()

  return (
    <header className="w-full sticky top-0 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
        <Link to="/" className="font-extrabold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">SubTrack</Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/pricing" className={({isActive})=>isActive? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}>Pricing</NavLink>
          <NavLink to="/dashboard" className={({isActive})=>isActive? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}>Dashboard</NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Link to="/login">
            <Button variant="outline" className="h-9 px-5">Log in</Button>
          </Link>
          <Link to="/register" className="hidden sm:block">
            <Button className="h-9 px-5">Start free</Button>
          </Link>
        </div>
      </div>
    </header>
  )
} 