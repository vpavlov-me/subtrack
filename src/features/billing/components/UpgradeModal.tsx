import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { stripePromise } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { Crown, Check, X } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentCount: number;
  maxCount: number;
}

export function UpgradeModal({
  open,
  onClose,
  currentCount,
  maxCount,
}: UpgradeModalProps) {
  const handleUpgrade = async () => {
    const stripe = await stripePromise;
    if (!stripe) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: import.meta.env.VITE_STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/dashboard?upgrade=success`,
      cancelUrl: window.location.href,
      clientReferenceId: user.id,
    });

    if (error) {
      console.error('Stripe checkout error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            You've reached the free plan limit of {maxCount} subscriptions.
            Upgrade to Pro for unlimited subscriptions and advanced features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <X className="h-4 w-4" />
              <span className="font-medium">Free Plan Limit</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Current: {currentCount} subscriptions • Limit: {maxCount}{' '}
              subscriptions
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Pro Plan Features:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Unlimited subscriptions
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Advanced analytics & reports
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Team collaboration
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Priority support
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleUpgrade} className="flex-1">
              Upgrade to Pro - $5/month
            </Button>
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
