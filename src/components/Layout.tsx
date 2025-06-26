import { ReactNode, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { NavLink } from 'react-router-dom'
import { useTheme } from '@/lib/theme'
import SubscriptionForm from '@/components/SubscriptionForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@workos-inc/authkit-react'
import { supabase } from '@/lib/supabase'
import SkipLink from '@/components/SkipLink'

export default function Layout({ children }: { children: ReactNode }) {
  const { dark } = useTheme()
  const [addOpen, setAddOpen] = useState(false)
  const { signOut } = useAuth()

  // TODO: вынести subscriptions в context/store для глобального доступа

  return (
    <>
      {/* Глобальный Dialog для добавления подписки */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogTrigger asChild>
          <Button className="fixed z-30 top-4 right-4 md:static md:ml-4" variant="default">+ Add</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
          </DialogHeader>
          <SubscriptionForm onSubmit={() => setAddOpen(false)} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
      <SkipLink />
      <div className={`min-h-screen ${dark ? 'bg-zinc-900' : 'bg-zinc-50'} flex flex-col`}>
        {/* Navbar */}
        <header className={`w-full border-b ${dark ? 'bg-zinc-950 border-zinc-800' : 'bg-white'}`} role="banner">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-8">
              <span className={`font-extrabold text-2xl tracking-tight select-none ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>SubTrack</span>
              <nav className="flex gap-6" aria-label="Primary navigation">
                <NavLink to="/dashboard" className={({isActive}) => isActive ? (dark ? 'font-bold text-zinc-100' : 'font-bold text-zinc-900') : (dark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 transition')}>Dashboard</NavLink>
                <NavLink to="/transactions" className={({isActive}) => isActive ? (dark ? 'font-bold text-zinc-100' : 'font-bold text-zinc-900') : (dark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 transition')}>Transactions</NavLink>
                <NavLink to="/settings" className={({isActive}) => isActive ? (dark ? 'font-bold text-zinc-100' : 'font-bold text-zinc-900') : (dark ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 transition')}>Settings</NavLink>
              </nav>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0">
                  <span className={`inline-block w-8 h-8 rounded-full ${dark ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={async () => {
                  await supabase.auth.signOut()
                  signOut()
                }}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* Main content */}
        <main id="main-content" className="flex-1 flex flex-col items-center" role="main">
          <div className="w-full max-w-4xl px-4 py-8">{children}</div>
        </main>
      </div>
    </>
  )
} 