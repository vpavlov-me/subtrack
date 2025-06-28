-- SubTrack Database Setup
-- Copy and paste this into Supabase Dashboard > SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  customer_id text,
  subscription_id text,
  subscription_status text,
  seat_count int NOT NULL DEFAULT 1,
  onboarding_complete boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 3. Create team members table
CREATE TABLE IF NOT EXISTS team_members (
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  member_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, member_id)
);

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  billing_cycle text DEFAULT 'monthly',
  next_billing_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for profiles
CREATE POLICY IF NOT EXISTS "profiles_select" ON profiles 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "profiles_insert" ON profiles 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "profiles_update" ON profiles 
  FOR UPDATE USING (user_id = auth.uid());

-- 7. Create RLS policies for teams
CREATE POLICY IF NOT EXISTS "teams_select" ON teams 
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "teams_insert" ON teams 
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "teams_update" ON teams 
  FOR UPDATE USING (owner_id = auth.uid());

-- 8. Create RLS policies for team members
CREATE POLICY IF NOT EXISTS "team_members_select" ON team_members 
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "team_members_insert" ON team_members 
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE owner_id = auth.uid()
    )
  );

-- 9. Create RLS policies for subscriptions
CREATE POLICY IF NOT EXISTS "subscriptions_select" ON subscriptions 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "subscriptions_insert" ON subscriptions 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "subscriptions_update" ON subscriptions 
  FOR UPDATE USING (user_id = auth.uid());

-- 10. Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles(user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- 13. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 15. Create view for user dashboard data
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  p.user_id,
  p.full_name,
  p.onboarding_complete,
  p.seat_count,
  COUNT(s.id) as subscription_count,
  COALESCE(SUM(s.amount), 0) as total_monthly_spend
FROM profiles p
LEFT JOIN subscriptions s ON p.user_id = s.user_id AND s.status = 'active'
GROUP BY p.user_id, p.full_name, p.onboarding_complete, p.seat_count;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO authenticated;

-- Success message
SELECT 'Database setup completed successfully!' as status; 