-- Create teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create enum for roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
    CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member');
  END IF;
END $$;

-- Team members linking table
CREATE TABLE team_members (
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  member_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, member_id)
);

-- =============================================
-- RLS policies
-- =============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Only owners/admins of a team can select the team row
CREATE POLICY "team_select" ON teams
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = id AND tm.member_id = auth.uid() AND tm.active = true
    )
  );

-- Insert: any logged-in user can create their own team (becomes owner)
CREATE POLICY "team_insert" ON teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Update/Delete: only owner
CREATE POLICY "team_owner_modify" ON teams
  FOR ALL USING (owner_id = auth.uid());

-- team_members policies
CREATE POLICY "members_select" ON team_members
  FOR SELECT USING (member_id = auth.uid() AND active = true);

CREATE POLICY "members_insert" ON team_members
  FOR INSERT WITH CHECK (
    -- only existing admin/owner of target team can invite
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_id AND tm.member_id = auth.uid() AND tm.role IN ('owner','admin') AND tm.active
    )
  );

CREATE POLICY "members_update" ON team_members
  FOR UPDATE USING (
    -- self can set active=false (leave team) OR admin/owner can change role/active
    (member_id = auth.uid()) OR (
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_id AND tm.member_id = auth.uid() AND tm.role IN ('owner','admin') AND tm.active
      )
    )
  );

CREATE POLICY "members_delete" ON team_members
  FOR DELETE USING (
    -- only owner can delete membership rows
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_id AND tm.member_id = auth.uid() AND tm.role = 'owner'
    )
  );

-- Grant owner role automatically on team insert
CREATE OR REPLACE FUNCTION handle_team_insert() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members(team_id, member_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_team_insert
AFTER INSERT ON teams
FOR EACH ROW EXECUTE PROCEDURE handle_team_insert(); 