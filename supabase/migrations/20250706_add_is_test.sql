-- Add is_test column to profiles table
-- This migration adds a boolean flag to identify test users

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

-- Create index for better performance on test user queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_test ON profiles(is_test);

-- Update existing profiles to ensure is_test is false for production users
UPDATE profiles SET is_test = false WHERE is_test IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_test IS 'Flag to identify test users for development and CI environments'; 