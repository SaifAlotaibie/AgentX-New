-- AgentX Database Schema (Updated & Synchronized & Future Proofed)
-- Run this in Supabase SQL Editor for a FRESH install only.
-- For existing databases, use database-schema-FIXED.sql

-- Drop existing tables if they exist (optional - comment out if you want to keep data)
-- DROP TABLE IF EXISTS agent_actions_log CASCADE;
-- DROP TABLE IF EXISTS resume_courses CASCADE;
-- DROP TABLE IF EXISTS labor_appointments CASCADE;
-- DROP TABLE IF EXISTS certificates CASCADE;
-- DROP TABLE IF EXISTS resumes CASCADE;
-- DROP TABLE IF EXISTS proactive_events CASCADE;
-- DROP TABLE IF EXISTS agent_feedback CASCADE;
-- DROP TABLE IF EXISTS work_regulations CASCADE;
-- DROP TABLE IF EXISTS employment_contracts CASCADE;
-- DROP TABLE IF EXISTS conversations CASCADE;
-- DROP TABLE IF EXISTS user_behavior CASCADE;
-- DROP TABLE IF EXISTS tickets CASCADE;
-- DROP TABLE IF EXISTS user_profile CASCADE;

-- User Profile Table
CREATE TABLE IF NOT EXISTS user_profile (
  user_id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  nationality TEXT DEFAULT 'سعودي',
  national_id TEXT, -- Added for Certificate Tools
  job_title TEXT,   -- Added for Certificate Tools
  preferred_language TEXT DEFAULT 'ar', -- 🔮 Future: Multi-language
  birth_date TEXT,
  gender TEXT,
  address TEXT,
  employee_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employment Contracts Table
CREATE TABLE IF NOT EXISTS employment_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  employer_name TEXT NOT NULL,
  position TEXT NOT NULL,
  salary NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'suspended')),
  contract_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Regulations Table
CREATE TABLE IF NOT EXISTS work_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proactive Events Table
CREATE TABLE IF NOT EXISTS proactive_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  acted BOOLEAN DEFAULT false,
  suggested_action TEXT,
  action_taken TEXT, -- Added for Logger
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action_at TIMESTAMP WITH TIME ZONE
);

-- Agent Feedback Table
CREATE TABLE IF NOT EXISTS agent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  conversation_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('salary_definition', 'service_certificate', 'labor_license')),
  content TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  job_title TEXT,
  skills TEXT[],
  experience_years INTEGER,
  education TEXT,
  summary TEXT,
  file_url TEXT, -- 🔮 Future: Resume Upload
  parsed_content JSONB DEFAULT '{}', -- 🔮 Future: Resume Parsing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume Courses Table
CREATE TABLE IF NOT EXISTS resume_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labor Appointments Table
CREATE TABLE IF NOT EXISTS labor_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  appointment_type TEXT,
  office_location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Actions Log Table
CREATE TABLE IF NOT EXISTS agent_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Kept as TEXT to match current state
  action_type TEXT NOT NULL,
  input_json JSONB DEFAULT '{}',
  output_json JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL UNIQUE,
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT, -- Added for Ticket Tools
  merged_with_ticket_id UUID REFERENCES tickets(id), -- 🔮 Future: Ticket Deduplication
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- 🔮 Future: Voice/Sentiment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Behavior Table
CREATE TABLE IF NOT EXISTS user_behavior (
  user_id UUID PRIMARY KEY REFERENCES user_profile(user_id) ON DELETE CASCADE,
  last_message TEXT,
  predicted_need TEXT,
  intent TEXT,
  interaction_count INTEGER DEFAULT 0, -- Added for Logger
  last_seen_service TEXT,              -- Added for Logger
  consecutive_complaints_count INTEGER DEFAULT 0, -- Added for Logger
  success_rate NUMERIC DEFAULT 1.0,    -- Added for Logger
  last_rating_at TIMESTAMP WITH TIME ZONE, -- Added for Logger
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employment_contracts_user_id ON employment_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_employment_contracts_status ON employment_contracts(status);
CREATE INDEX IF NOT EXISTS idx_proactive_events_user_id ON proactive_events(user_id);
CREATE INDEX IF NOT EXISTS idx_proactive_events_acted ON proactive_events(acted);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_user_id ON agent_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_courses_resume_id ON resume_courses(resume_id);
CREATE INDEX IF NOT EXISTS idx_labor_appointments_user_id ON labor_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_labor_appointments_status ON labor_appointments(status);
CREATE INDEX IF NOT EXISTS idx_agent_actions_log_user_id ON agent_actions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category); -- Added
CREATE INDEX IF NOT EXISTS idx_tickets_merged_with ON tickets(merged_with_ticket_id); -- Added
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_national_id ON user_profile(national_id); -- Added

-- Insert sample work regulations
INSERT INTO work_regulations (title, description, category, content) VALUES
('نظام العمل السعودي', 'نظام العمل الأساسي في المملكة العربية السعودية', 'قوانين عامة', 'نظام العمل السعودي يحدد العلاقة بين صاحب العمل والعامل ويضمن حقوق وواجبات كل طرف.'),
('ساعات العمل', 'تنظيم ساعات العمل اليومية والأسبوعية', 'ساعات العمل', 'ساعات العمل الفعلية للعامل لا تزيد على ثماني ساعات في اليوم، إذا كان العمل على أساس يومي، أو ثمان وأربعين ساعة في الأسبوع، إذا كان العمل على أساس أسبوعي.'),
('الإجازات السنوية', 'حق العامل في الإجازة السنوية المدفوعة', 'إجازات', 'للعامل الحق في إجازة سنوية لا تقل مدتها عن واحد وعشرين يوماً تزاد إلى مدة لا تقل عن ثلاثين يوماً إذا أمضى العامل في خدمة صاحب العمل خمس سنوات متصلة.')
ON CONFLICT DO NOTHING;
