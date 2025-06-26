-- User reminder preferences
CREATE TABLE reminder_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  days_before int NOT NULL DEFAULT 3 CHECK (days_before >= 0),
  channel text NOT NULL CHECK (channel IN ('email','slack')) DEFAULT 'email',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER set_reminder_prefs_updated_at
BEFORE UPDATE ON reminder_prefs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reminder_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prefs_select" ON reminder_prefs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "prefs_upsert" ON reminder_prefs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); 