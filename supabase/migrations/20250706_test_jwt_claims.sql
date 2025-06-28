-- JWT custom claims for test users
-- This migration adds functions to set and validate test user claims

-- Function to set test user claims in JWT
CREATE OR REPLACE FUNCTION set_test_user_claims(user_id uuid, is_test boolean)
RETURNS void AS $$
BEGIN
  -- Set custom claims for the user
  PERFORM set_config('request.jwt.claims', 
    json_build_object(
      'is_test', is_test,
      'user_id', user_id::text,
      'email', (SELECT email FROM auth.users WHERE id = user_id)
    )::text, 
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create test user with proper claims
CREATE OR REPLACE FUNCTION create_test_user(
  email text,
  password text,
  full_name text DEFAULT 'Test User'
)
RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Create user in auth.users (this would be done via Supabase Admin API in practice)
  -- For now, we'll assume the user exists and just create the profile
  
  -- Get the user_id (in practice, this would come from the auth.users table)
  SELECT id INTO user_id FROM auth.users WHERE email = create_test_user.email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist', email;
  END IF;
  
  -- Create profile with is_test flag
  INSERT INTO profiles (user_id, full_name, is_test)
  VALUES (user_id, full_name, true)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_test = true,
    full_name = EXCLUDED.full_name,
    updated_at = now();
  
  -- Set JWT claims for test user
  PERFORM set_test_user_claims(user_id, true);
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate test user access
CREATE OR REPLACE FUNCTION is_test_user()
RETURNS boolean AS $$
BEGIN
  RETURN (jwt.claims ->> 'is_test')::boolean = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to validate production user access
CREATE OR REPLACE FUNCTION is_production_user()
RETURNS boolean AS $$
BEGIN
  RETURN (jwt.claims ->> 'is_test')::boolean = false OR (jwt.claims ->> 'is_test') IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current user test status
CREATE OR REPLACE FUNCTION get_user_test_status()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND is_test = true
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_test_user_claims(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION create_test_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_test_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_production_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_test_status() TO authenticated; 