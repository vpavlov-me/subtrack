-- Enforce free plan subscription limits
-- Add function to check subscription count
CREATE OR REPLACE FUNCTION check_subscription_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  user_status TEXT;
BEGIN
  -- Get user's subscription status
  SELECT subscription_status INTO user_status
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- If user is on free plan, check limit
  IF user_status IS NULL OR user_status = 'free' THEN
    -- Count current subscriptions
    SELECT COUNT(*) INTO current_count
    FROM subscriptions
    WHERE user_id = auth.uid();
    
    -- Block if trying to exceed 5 subscriptions
    IF current_count >= 5 THEN
      RAISE EXCEPTION 'Free plan limit exceeded. Maximum 5 subscriptions allowed.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to enforce limit on INSERT
DROP TRIGGER IF EXISTS enforce_subscription_limit ON subscriptions;
CREATE TRIGGER enforce_subscription_limit
  BEFORE INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_limit();

-- Add trigger to enforce limit on UPDATE (in case user downgrades)
CREATE TRIGGER enforce_subscription_limit_update
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_limit(); 