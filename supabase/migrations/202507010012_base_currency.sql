-- Add base_currency column to profiles
ALTER TABLE profiles 
ADD COLUMN base_currency CHAR(3) DEFAULT 'USD';

-- Add index for performance
CREATE INDEX idx_profiles_base_currency ON profiles(base_currency);

-- Update existing profiles to have USD as default
UPDATE profiles 
SET base_currency = 'USD' 
WHERE base_currency IS NULL; 