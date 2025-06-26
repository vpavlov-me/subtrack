import PlanSelector from '@/features/billing/PlanSelector'
import BillingStatusCard from '@/features/billing/BillingStatusCard'

export default function Billing() {
  return (
    <div className="space-y-8">
      <BillingStatusCard />
      <PlanSelector />
    </div>
  )
} 