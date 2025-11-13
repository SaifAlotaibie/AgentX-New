-- AgentX Database Schema
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (optional - comment out if you want to keep data)
-- DROP TABLE IF EXISTS agent_actions_log CASCADE;
-- DROP TABLE IF EXISTS resume_courses CASCADE;
-- DROP TABLE IF EXISTS labor_appointments CASCADE;
-- DROP TABLE IF EXISTS certificates CASCADE;
-- DROP TABLE IF EXISTS resumes CASCADE;
-- DROP TABLE IF EXISTS domestic_labor_requests CASCADE;
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

-- Domestic Labor Requests Table
CREATE TABLE IF NOT EXISTS domestic_labor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profile(user_id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  worker_nationality TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  request_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  appointment_type TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Actions Log Table
CREATE TABLE IF NOT EXISTS agent_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Behavior Table
CREATE TABLE IF NOT EXISTS user_behavior (
  user_id UUID PRIMARY KEY REFERENCES user_profile(user_id) ON DELETE CASCADE,
  last_message TEXT,
  predicted_need TEXT,
  intent TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employment_contracts_user_id ON employment_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_employment_contracts_status ON employment_contracts(status);
CREATE INDEX IF NOT EXISTS idx_domestic_requests_user_id ON domestic_labor_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_domestic_requests_status ON domestic_labor_requests(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_courses_resume_id ON resume_courses(resume_id);
CREATE INDEX IF NOT EXISTS idx_labor_appointments_user_id ON labor_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_labor_appointments_status ON labor_appointments(status);
CREATE INDEX IF NOT EXISTS idx_agent_actions_log_user_id ON agent_actions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Insert sample work regulations
INSERT INTO work_regulations (title, description, category, content) VALUES
('نظام العمل السعودي', 'نظام العمل الأساسي في المملكة العربية السعودية', 'قوانين عامة', 'نظام العمل السعودي يحدد العلاقة بين صاحب العمل والعامل ويضمن حقوق وواجبات كل طرف.'),
('ساعات العمل', 'تنظيم ساعات العمل اليومية والأسبوعية', 'ساعات العمل', 'ساعات العمل الفعلية للعامل لا تزيد على ثماني ساعات في اليوم، إذا كان العمل على أساس يومي، أو ثمان وأربعين ساعة في الأسبوع، إذا كان العمل على أساس أسبوعي.'),
('الإجازات السنوية', 'حق العامل في الإجازة السنوية المدفوعة', 'إجازات', 'للعامل الحق في إجازة سنوية لا تقل مدتها عن واحد وعشرين يوماً تزاد إلى مدة لا تقل عن ثلاثين يوماً إذا أمضى العامل في خدمة صاحب العمل خمس سنوات متصلة.')
ON CONFLICT DO NOTHING;


