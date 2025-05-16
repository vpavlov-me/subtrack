export type Subscription = {
  id: string;
  user_id: string;
  name: string;
  category: 'SaaS' | 'Hosting' | 'Tool' | 'Other';
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  next_payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
}; 