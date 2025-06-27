import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Users, Crown } from 'lucide-react'

interface SeatLimitBannerProps {
  currentMembers: number
  maxSeats: number
  onUpgrade: () => void
}

export function SeatLimitBanner({ currentMembers, maxSeats, onUpgrade }: SeatLimitBannerProps) {
  const isAtLimit = currentMembers >= maxSeats

  if (!isAtLimit) return null

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <Users className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-orange-800 dark:text-orange-200">
            Team seat limit reached
          </span>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            You have {currentMembers} members but only {maxSeats} seats available. 
            Upgrade your plan to add more team members.
          </p>
        </div>
        <Button 
          onClick={onUpgrade}
          size="sm"
          className="ml-4 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade Plan
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function SeatUsageIndicator({ currentMembers, maxSeats }: { currentMembers: number; maxSeats: number }) {
  const usagePercentage = Math.round((currentMembers / maxSeats) * 100)
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = usagePercentage >= 100

  if (!isNearLimit) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div 
          className={`h-2 rounded-full transition-all ${
            isAtLimit ? 'bg-red-500' : 'bg-orange-500'
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      <span className={`font-medium ${
        isAtLimit ? 'text-red-600' : 'text-orange-600'
      }`}>
        {currentMembers}/{maxSeats}
      </span>
    </div>
  )
} 