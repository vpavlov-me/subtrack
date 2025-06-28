import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatLimitBannerProps {
  currentSeats: number;
  maxSeats: number;
  onUpgrade: () => void;
}

export function SeatLimitBanner({
  currentSeats,
  maxSeats,
  onUpgrade,
}: SeatLimitBannerProps) {
  const usagePercentage = (currentSeats / maxSeats) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  if (!isNearLimit) {
    return null;
  }

  return (
    <div className={cn(
      'rounded-lg border p-4',
      isAtLimit 
        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
        : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
          isAtLimit ? 'bg-red-100 dark:bg-red-900' : 'bg-yellow-100 dark:bg-yellow-900'
        )}>
          <Users className={cn(
            'w-3 h-3',
            isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'text-sm font-medium',
            isAtLimit ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
          )}>
            {isAtLimit ? 'Seat Limit Reached' : 'Approaching Seat Limit'}
          </h3>
          <p className={cn(
            'text-sm mt-1',
            isAtLimit ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
          )}>
            {isAtLimit 
              ? `You've reached your limit of ${maxSeats} seats. Upgrade to add more team members.`
              : `You're using ${currentSeats} of ${maxSeats} seats (${Math.round(usagePercentage)}%). Consider upgrading soon.`
            }
          </p>
          
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className={cn(
                  isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                )}>
                  Seats Used
                </span>
                <span className={cn(
                  isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                )}>
                  {currentSeats} / {maxSeats}
                </span>
              </div>
              <div className={cn(
                'h-2 rounded-full overflow-hidden',
                isAtLimit ? 'bg-red-200 dark:bg-red-800' : 'bg-yellow-200 dark:bg-yellow-800'
              )}>
                <div 
                  className={cn(
                    'h-full transition-all duration-300',
                    isAtLimit ? 'bg-red-500 dark:bg-red-400' : 'bg-yellow-500 dark:bg-yellow-400'
                  )}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={onUpgrade}
              className={cn(
                'flex-shrink-0',
                isAtLimit 
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' 
                  : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600'
              )}
            >
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SeatUsageIndicator({
  currentMembers: currentSeats,
  maxSeats,
}: {
  currentMembers: number;
  maxSeats: number;
}) {
  const usagePercentage = Math.round((currentSeats / maxSeats) * 100);
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  if (!isNearLimit) return null;

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
      <span
        className={`font-medium ${
          isAtLimit ? 'text-red-600' : 'text-orange-600'
        }`}
      >
        {currentSeats}/{maxSeats}
      </span>
    </div>
  );
}
