-- RLS policies for test data isolation
-- This migration ensures test users can only access test data and vice versa

-- Update subscriptions RLS policies to respect test isolation
DROP POLICY IF EXISTS "Allow users read own" ON subscriptions;
CREATE POLICY "Allow users read own" ON subscriptions 
  FOR SELECT USING (
    auth.uid() = user_id AND (
      -- Production users can only see production data
      (NOT (jwt.claims ->> 'is_test')::boolean AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      )) OR
      -- Test users can only see test data
      ((jwt.claims ->> 'is_test')::boolean AND EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      ))
    )
  );

DROP POLICY IF EXISTS "Allow users insert own" ON subscriptions;
CREATE POLICY "Allow users insert own" ON subscriptions 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      -- Production users can only insert production data
      (NOT (jwt.claims ->> 'is_test')::boolean AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      )) OR
      -- Test users can only insert test data
      ((jwt.claims ->> 'is_test')::boolean AND EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      ))
    )
  );

DROP POLICY IF EXISTS "Allow users update own" ON subscriptions;
CREATE POLICY "Allow users update own" ON subscriptions 
  FOR UPDATE USING (
    auth.uid() = user_id AND (
      -- Production users can only update production data
      (NOT (jwt.claims ->> 'is_test')::boolean AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      )) OR
      -- Test users can only update test data
      ((jwt.claims ->> 'is_test')::boolean AND EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      ))
    )
  ) WITH CHECK (
    auth.uid() = user_id AND (
      -- Production users can only update production data
      (NOT (jwt.claims ->> 'is_test')::boolean AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      )) OR
      -- Test users can only update test data
      ((jwt.claims ->> 'is_test')::boolean AND EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      ))
    )
  );

DROP POLICY IF EXISTS "Allow users delete own" ON subscriptions;
CREATE POLICY "Allow users delete own" ON subscriptions 
  FOR DELETE USING (
    auth.uid() = user_id AND (
      -- Production users can only delete production data
      (NOT (jwt.claims ->> 'is_test')::boolean AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      )) OR
      -- Test users can only delete test data
      ((jwt.claims ->> 'is_test')::boolean AND EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      ))
    )
  );

-- Update teams RLS policies for test isolation
DROP POLICY IF EXISTS "team_select" ON teams;
CREATE POLICY "team_select" ON teams
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = id AND tm.member_id = auth.uid() AND tm.active = true
    ) AND (
      -- Production users can only see production teams
      (NOT (jwt.claims ->> 'is_test')::boolean AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      )) OR
      -- Test users can only see test teams
      ((jwt.claims ->> 'is_test')::boolean AND EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      ))
    )
  );

-- Update team_members RLS policies for test isolation
DROP POLICY IF EXISTS "members_select" ON team_members;
CREATE POLICY "members_select" ON team_members
  FOR SELECT USING (
    member_id = auth.uid() AND active = true AND (
      -- Production users can only see production team members
      (NOT (jwt.claims ->> 'is_test')::boolean AND NOT EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      )) OR
      -- Test users can only see test team members
      ((jwt.claims ->> 'is_test')::boolean AND EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_test = true
      ))
    )
  ); 