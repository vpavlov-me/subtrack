import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscriptions } from '@/features/subscriptions/SubscriptionsProvider';
import { useCurrency } from '@/features/currency/CurrencyProvider';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export default function KPICards() {
  const { subscriptions } = useSubscriptions();
  const { userCurrency, convert, formatAmount } = useCurrency();

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = subscriptions.reduce((total, sub) => {
    const amount = sub.billingCycle === 'monthly' ? sub.price : sub.price / 12; // Convert yearly to monthly
    return total + convert(amount, sub.currency || 'USD', userCurrency);
  }, 0);

  // Calculate Annual Revenue
  const annualRevenue = subscriptions.reduce((total, sub) => {
    const amount = sub.billingCycle === 'yearly' ? sub.price : sub.price * 12; // Convert monthly to yearly
    return total + convert(amount, sub.currency || 'USD', userCurrency);
  }, 0);

  // Calculate saved amount (placeholder - could be based on cancelled subscriptions)
  const savedAmount = 0; // TODO: Implement based on cancelled subscriptions

  // Calculate next payment
  const nextPayment = subscriptions.reduce((total, sub) => {
    const nextDate = new Date(sub.nextBillingDate);
    const today = new Date();
    const daysUntil = Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= 7 && daysUntil >= 0) {
      return total + convert(sub.price, sub.currency || 'USD', userCurrency);
    }
    return total;
  }, 0);

  const kpis = [
    {
      title: 'Monthly Recurring Revenue',
      value: formatAmount(mrr, userCurrency),
      description: 'Total monthly subscriptions',
      icon: TrendingUp,
      trend: 'up',
      color: 'text-green-600',
    },
    {
      title: 'Annual Revenue',
      value: formatAmount(annualRevenue, userCurrency),
      description: 'Projected yearly revenue',
      icon: DollarSign,
      trend: 'up',
      color: 'text-blue-600',
    },
    {
      title: 'Next 7 Days',
      value: formatAmount(nextPayment, userCurrency),
      description: 'Upcoming payments',
      icon: Calendar,
      trend: 'neutral',
      color: 'text-orange-600',
    },
    {
      title: 'Saved After Cancel',
      value: formatAmount(savedAmount, userCurrency),
      description: 'Money saved from cancellations',
      icon: TrendingDown,
      trend: 'down',
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
