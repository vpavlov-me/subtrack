import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSubscriptions } from '@/features/subscriptions/SubscriptionsProvider'

interface PlanGuardResult {
  canAddSubscription: boolean
  showUpgradeModal: boolean
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
  subscriptionCount: number
  maxSubscriptions: number
}

export function usePlanGuard(): PlanGuardResult {
  const [billingStatus, setBillingStatus] = useState<string>('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { subscriptions } = useSubscriptions()

  useEffect(() => {
    const loadBillingStatus = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('billing_status')
        .single()
      
      setBillingStatus(profile?.billing_status || 'free')
    }

    void loadBillingStatus()
  }, [])

  const subscriptionCount = subscriptions.length
  const maxSubscriptions = billingStatus === 'active' ? Infinity : 5
  const canAddSubscription = subscriptionCount < maxSubscriptions

  const openUpgradeModal = () => setShowUpgradeModal(true)
  const closeUpgradeModal = () => setShowUpgradeModal(false)

  return {
    canAddSubscription,
    showUpgradeModal,
    openUpgradeModal,
    closeUpgradeModal,
    subscriptionCount,
    maxSubscriptions,
  }
} 