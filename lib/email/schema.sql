-- Email Notifications Log Table
CREATE TABLE IF NOT EXISTS email_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  email_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

-- Add email notification preferences to user_profile
ALTER TABLE user_profile
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"tickets": true, "contracts": true, "profile": true, "certificates": true}';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_user_id ON email_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_sent_at ON email_notifications_log(sent_at);
