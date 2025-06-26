import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Landing from '@/pages/Landing'
import Pricing from '@/pages/Pricing'
import TeamSettings from '@/pages/TeamSettings'
import Billing from '@/pages/Billing'
import OnboardingPage from '@/pages/Onboarding'
import { useSubscriptions } from '@/features/subscriptions/SubscriptionsProvider'
import { ReactElement } from 'react'

function LayoutRoute() {
  return <Layout><Outlet /></Layout>
}

function RequireOnboarding({ children }: { children: ReactElement }) {
  const { subscriptions, loading } = useSubscriptions()
  if (loading) return null
  if (subscriptions.length===0 && localStorage.getItem('onboarding_done')!=='true') return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route element={<LayoutRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<RequireOnboarding><Dashboard/></RequireOnboarding>} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/team" element={<TeamSettings />} />
          <Route path="/settings/billing" element={<Billing />} />
          <Route path="/subscriptions" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    </Router>
  )
}
