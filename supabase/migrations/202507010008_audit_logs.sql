-- Audit logs table for security monitoring
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS policies for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own audit logs
CREATE POLICY "audit_logs_select" ON audit_logs 
  FOR SELECT USING (user_id = auth.uid());

-- Only service role can insert audit logs
CREATE POLICY "audit_logs_insert" ON audit_logs 
  FOR INSERT WITH CHECK (true);

-- Function to clean old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < now() - interval '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job to clean old audit logs (monthly)
SELECT cron.schedule(
  'clean-audit-logs',
  '0 2 1 * *', -- First day of month at 2 AM
  'SELECT clean_old_audit_logs();'
); 