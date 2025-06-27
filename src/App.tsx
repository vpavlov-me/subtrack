import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Import from '@/pages/Import';
import Notifications from '@/pages/Notifications';
import Transactions from '@/pages/Transactions';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Landing from '@/pages/Landing';
import Pricing from '@/pages/Pricing';
import TeamSettings from '@/pages/TeamSettings';
import Billing from '@/pages/Billing';
import OnboardingPage from '@/pages/Onboarding';
import TeamAdvanced from '@/pages/TeamAdvanced';
import { useSubscriptions } from '@/features/subscriptions/SubscriptionsProvider';
import { ReactElement, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function LayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RequireOnboarding({ children }: { children: ReactElement }) {
  const { subscriptions, loading } = useSubscriptions();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  );
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .single();

        setOnboardingComplete(profile?.onboarding_complete ?? false);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem('onboarding_done');
        setOnboardingComplete(stored === 'true');
      } finally {
        setCheckingOnboarding(false);
      }
    };

    void checkOnboarding();
  }, []);

  if (loading || checkingOnboarding) return null;

  // Show onboarding if user has no subscriptions and hasn't completed onboarding
  if (subscriptions.length === 0 && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
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
          <Route
            path="/dashboard"
            element={
              <RequireOnboarding>
                <Dashboard />
              </RequireOnboarding>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireOnboarding>
                <Analytics />
              </RequireOnboarding>
            }
          />
          <Route
            path="/import"
            element={
              <RequireOnboarding>
                <Import />
              </RequireOnboarding>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireOnboarding>
                <Notifications />
              </RequireOnboarding>
            }
          />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/team" element={<TeamSettings />} />
          <Route path="/settings/billing" element={<Billing />} />
          <Route
            path="/subscriptions"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/team/advanced"
            element={
              <RequireOnboarding>
                <TeamAdvanced />
              </RequireOnboarding>
            }
          />
        </Route>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    </Router>
  );
}
