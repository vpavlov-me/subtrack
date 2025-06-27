-- RLS function to check team seat limits
-- Prevents adding team members when seat_count < team size

CREATE OR REPLACE FUNCTION check_team_seats()
RETURNS TRIGGER AS $$
DECLARE
  current_seat_count INTEGER;
  current_team_size INTEGER;
BEGIN
  -- Get the team's seat count from profiles
  SELECT seat_count INTO current_seat_count
  FROM profiles
  WHERE user_id = (
    SELECT owner_id FROM teams WHERE id = NEW.team_id
  );
  
  -- Get current team size (active members)
  SELECT COUNT(*) INTO current_team_size
  FROM team_members
  WHERE team_id = NEW.team_id AND active = true;
  
  -- If this is a new member (INSERT), check if adding them would exceed seat limit
  IF TG_OP = 'INSERT' THEN
    IF current_team_size >= current_seat_count THEN
      RAISE EXCEPTION 'Team seat limit exceeded. Current seats: %, Team size: %. Please upgrade your plan to add more members.', 
        current_seat_count, current_team_size;
    END IF;
  END IF;
  
  -- If this is an update to activate a member, check seat limit
  IF TG_OP = 'UPDATE' AND NEW.active = true AND OLD.active = false THEN
    IF current_team_size >= current_seat_count THEN
      RAISE EXCEPTION 'Team seat limit exceeded. Current seats: %, Team size: %. Please upgrade your plan to add more members.', 
        current_seat_count, current_team_size;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to enforce seat limits on team_members table
DROP TRIGGER IF EXISTS enforce_team_seats ON team_members;
CREATE TRIGGER enforce_team_seats
  BEFORE INSERT OR UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION check_team_seats();

-- Function to get team seat usage info
CREATE OR REPLACE FUNCTION get_team_seat_usage(team_id_param UUID)
RETURNS TABLE (
  seat_count INTEGER,
  current_members INTEGER,
  available_seats INTEGER,
  is_at_limit BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.seat_count,
    COUNT(tm.member_id)::INTEGER as current_members,
    (p.seat_count - COUNT(tm.member_id))::INTEGER as available_seats,
    COUNT(tm.member_id) >= p.seat_count as is_at_limit
  FROM teams t
  JOIN profiles p ON p.user_id = t.owner_id
  LEFT JOIN team_members tm ON tm.team_id = t.id AND tm.active = true
  WHERE t.id = team_id_param
  GROUP BY p.seat_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_team_seat_usage(UUID) TO authenticated; 