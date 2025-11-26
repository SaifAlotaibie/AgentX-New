-- ==============================================================================
-- 🛠️ AgentX Schema Fix Script (Triple Checked & Future Proofed)
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to synchronize your database
-- with the actual code requirements AND future features.
-- ==============================================================================

-- 1️⃣ Fix user_profile (Missing columns for Certificates & Resumes)
-- Used in: certificateTools.ts, resumeTools.ts
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS national_id TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'ar'; -- 🔮 Future: Multi-language support

-- 2️⃣ Fix tickets (Missing category for Ticket Tools)
-- Used in: ticketTools.ts
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS merged_with_ticket_id UUID REFERENCES tickets(id); -- 🔮 Future: Ticket Deduplication

-- 3️⃣ Fix user_behavior (Missing analytics fields)
-- Used in: logger.ts
ALTER TABLE user_behavior 
ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_seen_service TEXT,
ADD COLUMN IF NOT EXISTS consecutive_complaints_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_rate NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS last_rating_at TIMESTAMP WITH TIME ZONE;

-- 4️⃣ Fix proactive_events (Missing action tracking)
-- Used in: logger.ts
ALTER TABLE proactive_events 
ADD COLUMN IF NOT EXISTS action_taken TEXT;

-- 5️⃣ Fix resumes (Future Proofing for Resume Upload)
-- 🔮 Future: Resume Upload & Parsing
ALTER TABLE resumes
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS parsed_content JSONB DEFAULT '{}';

-- 6️⃣ Fix conversations (Future Proofing for Voice/Sentiment)
-- 🔮 Future: Voice Audio URLs & Sentiment Metadata
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 7️⃣ Fix agent_actions_log (Type mismatch: user_id should be UUID)
-- ⚠️ WARNING: This requires data migration if table is not empty.
-- Uncomment the following block if you want to fix this and know what you are doing.

/*
-- Step A: Create temporary column
ALTER TABLE agent_actions_log ADD COLUMN user_id_uuid UUID;

-- Step B: Migrate data (attempt to cast, set null if invalid)
UPDATE agent_actions_log 
SET user_id_uuid = CASE 
    WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN user_id::UUID 
    ELSE NULL 
END;

-- Step C: Drop old column and rename new one
ALTER TABLE agent_actions_log DROP COLUMN user_id;
ALTER TABLE agent_actions_log RENAME COLUMN user_id_uuid TO user_id;

-- Step D: Add foreign key
ALTER TABLE agent_actions_log 
ADD CONSTRAINT agent_actions_log_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE;

-- Step E: Re-add index
CREATE INDEX idx_agent_actions_log_user_id ON agent_actions_log(user_id);
*/

-- ==============================================================================
-- 🚀 Performance Indexes (Recommended)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profile_national_id ON user_profile(national_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_merged_with ON tickets(merged_with_ticket_id);

-- ==============================================================================
-- ✅ Verification Query
-- ==============================================================================

SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (
    (table_name = 'user_profile' AND column_name IN ('national_id', 'job_title', 'preferred_language')) OR
    (table_name = 'tickets' AND column_name IN ('category', 'merged_with_ticket_id')) OR
    (table_name = 'user_behavior' AND column_name IN ('interaction_count', 'last_seen_service')) OR
    (table_name = 'proactive_events' AND column_name = 'action_taken') OR
    (table_name = 'resumes' AND column_name IN ('file_url', 'parsed_content')) OR
    (table_name = 'conversations' AND column_name = 'metadata')
)
ORDER BY table_name, column_name;
