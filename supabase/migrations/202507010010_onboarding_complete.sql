-- Add onboarding_complete column to profiles
ALTER TABLE profiles 
ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX idx_profiles_onboarding_complete ON profiles(onboarding_complete);

-- Update existing users to have onboarding complete (for existing users)
UPDATE profiles 
SET onboarding_complete = TRUE 
WHERE onboarding_complete IS NULL; 