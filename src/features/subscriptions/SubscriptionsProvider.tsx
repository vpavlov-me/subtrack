import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { Subscription, SubscriptionCreate, SubscriptionUpdate } from './types';
import {
  fetchSubscriptions,
  addSubscription as add,
  updateSubscription as update,
  deleteSubscription as remove,
} from './api';
import { toast } from 'sonner';

interface SubscriptionsContextType {
  loading: boolean;
  /** raw list */
  subscriptions: Subscription[];
  /** subscriptions filtered by current filters */
  filteredSubscriptions: Subscription[];
  /** derived totals (across ALL subscriptions) */
  totals: {
    monthly: number;
    yearly: number;
  };

  // filters
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  billingCycleFilter: 'monthly' | 'yearly' | 'all';
  setBillingCycleFilter: (v: 'monthly' | 'yearly' | 'all') => void;

  reload: () => Promise<void>;
  addSubscription: (data: SubscriptionCreate) => Promise<void>;
  updateSubscription: (id: string, data: SubscriptionUpdate) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
}

const SubscriptionsContext = createContext<
  SubscriptionsContextType | undefined
>(undefined);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [billingCycleFilter, setBillingCycleFilter] = useState<
    'monthly' | 'yearly' | 'all'
  >('all');

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchSubscriptions();
    setSubscriptions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addSubscription = async (data: SubscriptionCreate) => {
    const newSub = await add(data);
    setSubscriptions(prev => [...prev, newSub]);
    toast.success('Subscription added');
  };

  const updateSubscription = async (id: string, data: SubscriptionUpdate) => {
    const updated = await update(id, data);
    setSubscriptions(prev => prev.map(s => (s.id === id ? updated : s)));
    toast.success('Subscription updated');
  };

  const deleteSubscription = async (id: string) => {
    await remove(id);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    toast.success('Subscription deleted');
  };

  // derived values
  const filteredSubscriptions = subscriptions.filter(
    sub =>
      (categoryFilter === 'All' || sub.category === categoryFilter) &&
      (billingCycleFilter === 'all' || sub.billingCycle === billingCycleFilter)
  );

  const totals = React.useMemo(() => {
    const monthly = subscriptions.reduce(
      (sum, sub) =>
        sum + (sub.billingCycle === 'monthly' ? sub.price : sub.price / 12),
      0
    );
    const yearly = subscriptions.reduce(
      (sum, sub) =>
        sum + (sub.billingCycle === 'yearly' ? sub.price : sub.price * 12),
      0
    );
    return { monthly, yearly };
  }, [subscriptions]);

  return (
    <SubscriptionsContext.Provider
      value={{
        loading,
        subscriptions,
        filteredSubscriptions,
        totals,
        categoryFilter,
        setCategoryFilter,
        billingCycleFilter,
        setBillingCycleFilter,
        reload,
        addSubscription,
        updateSubscription,
        deleteSubscription,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx)
    throw new Error(
      'useSubscriptions must be used within <SubscriptionsProvider>'
    );
  return ctx;
}
