-- Ensure onboarding_complete has proper default value
ALTER TABLE profiles 
ALTER COLUMN onboarding_complete SET DEFAULT FALSE;

-- Update any NULL values to FALSE
UPDATE profiles 
SET onboarding_complete = FALSE 
WHERE onboarding_complete IS NULL;

-- Add index for better performance on onboarding checks
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_complete_user_id 
ON profiles(onboarding_complete, user_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.onboarding_complete IS 'Whether the user has completed the onboarding process'; 