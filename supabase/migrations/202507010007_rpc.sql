-- RPC to fetch subscriptions due according to reminder prefs
CREATE OR REPLACE FUNCTION fetch_due_reminders()
RETURNS TABLE (
  user_id uuid,
  email text,
  profile_currency char(3),
  days_before int,
  tz text,
  name text,
  amount numeric,
  currency char(3),
  next_payment_date date
) AS $$
  SELECT u.id,
         u.email,
         coalesce(p.currency_preference,'USD') AS profile_currency,
         rp.days_before,
         s.tz,
         s.name,
         s.amount,
         s.currency,
         s.next_payment_date
  FROM subscriptions s
  JOIN reminder_prefs rp ON rp.user_id = s.user_id
  JOIN auth.users u ON u.id = s.user_id
  LEFT JOIN profiles p ON p.user_id = s.user_id
  WHERE s.next_payment_date = (current_date + rp.days_before)
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION fetch_due_reminders() TO anon, authenticated;

-- Ensure refresh function grant
GRANT EXECUTE ON FUNCTION refresh_kpi_dashboard() TO authenticated; 