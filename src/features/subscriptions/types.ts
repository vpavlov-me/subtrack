export type BillingCycle = 'monthly' | 'yearly' | 'custom';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency?: string;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  category?: string;
  paymentMethod?: string;
  notes?: string;
  status?: 'active' | 'cancelled' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export type SortField = 'name' | 'price' | 'nextBillingDate';
export type SortOrder = 'asc' | 'desc';
export type BillingCycleFilter = 'all' | BillingCycle;

// Типы для API
export type SubscriptionInput = Omit<
  Subscription,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SubscriptionCreate = SubscriptionInput;
export type SubscriptionUpdate = SubscriptionInput;
