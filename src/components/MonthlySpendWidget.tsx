import { useSubscriptions } from '@/features/subscriptions/SubscriptionsProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MonthlySpendWidget() {
  const { totals } = useSubscriptions()
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>This month</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          ${totals.monthly.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  )
} 