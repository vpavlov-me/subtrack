-- Add missing Stripe webhook fields to profiles
ALTER TABLE profiles 
ADD COLUMN current_period_end TIMESTAMPTZ,
ADD COLUMN cancel_at TIMESTAMPTZ,
ADD COLUMN billing_status TEXT DEFAULT 'free';

-- Add index for webhook lookups
CREATE INDEX idx_profiles_subscription_id ON profiles(subscription_id);

-- Update existing profiles to have billing_status
UPDATE profiles 
SET billing_status = COALESCE(subscription_status, 'free')
WHERE billing_status IS NULL; 