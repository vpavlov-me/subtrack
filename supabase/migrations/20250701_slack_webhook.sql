-- Add Slack webhook URL field to reminder preferences
ALTER TABLE reminder_prefs 
ADD COLUMN slack_webhook_url TEXT;

-- Add index for performance
CREATE INDEX idx_reminder_prefs_slack_webhook ON reminder_prefs(slack_webhook_url) 
WHERE slack_webhook_url IS NOT NULL;

-- Add constraint to ensure webhook URL is valid when channel is slack
ALTER TABLE reminder_prefs 
ADD CONSTRAINT check_slack_webhook 
CHECK (
  (channel = 'slack' AND slack_webhook_url IS NOT NULL) OR 
  (channel = 'email' AND slack_webhook_url IS NULL)
);

-- Add function to validate Slack webhook URL format
CREATE OR REPLACE FUNCTION validate_slack_webhook_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.channel = 'slack' AND NEW.slack_webhook_url IS NOT NULL THEN
    IF NEW.slack_webhook_url NOT LIKE 'https://hooks.slack.com/%' THEN
      RAISE EXCEPTION 'Invalid Slack webhook URL format. Must start with https://hooks.slack.com/';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate webhook URL
DROP TRIGGER IF EXISTS validate_slack_webhook ON reminder_prefs;
CREATE TRIGGER validate_slack_webhook
  BEFORE INSERT OR UPDATE ON reminder_prefs
  FOR EACH ROW
  EXECUTE FUNCTION validate_slack_webhook_url(); 