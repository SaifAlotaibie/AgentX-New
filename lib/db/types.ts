// Database table interfaces

export interface UserProfile {
  user_id: string
  full_name: string
  phone?: string
  email?: string
  nationality?: string
  birth_date?: string
  gender?: string
  address?: string
  employee_number?: string
  created_at?: string
}

export interface EmploymentContract {
  id: string
  user_id: string
  employer_name: string
  position: string
  salary: number
  start_date: string
  end_date?: string
  status: 'active' | 'ended' | 'suspended'
  contract_type: string
  created_at?: string
  updated_at?: string
}

export interface WorkRegulation {
  id: string
  title: string
  description: string
  category: string
  content: string
  created_at?: string
}

export interface Certificate {
  id: string
  user_id: string
  certificate_type: 'salary_definition' | 'service_certificate' | 'labor_license'
  content: string
  issue_date: string
  status?: string
  created_at?: string
}

export interface Resume {
  id: string
  user_id: string
  job_title?: string
  skills?: string[]
  experience_years?: number
  education?: string
  summary?: string
  created_at?: string
  updated_at?: string
}

export interface ResumeCourse {
  id: string
  resume_id: string
  course_name: string
  provider: string
  date_completed: string
  certificate_url?: string
  created_at?: string
}

export interface LaborAppointment {
  id: string
  user_id: string
  appointment_type?: string
  office_location: string
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface AgentActionLog {
  id: string
  user_id: string
  action_type: string
  input_json: any
  output_json: any
  success: boolean
  created_at?: string
}

export interface Ticket {
  id: string
  ticket_number?: number
  user_id: string
  title: string
  description?: string
  category?: string
  status: 'open' | 'closed'
  created_at?: string
  updated_at?: string
}

export interface Conversation {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface UserBehavior {
  user_id: string
  last_message?: string
  predicted_need?: string
  intent?: string
  updated_at?: string
}

export interface ProactiveEvent {
  id: string
  user_id: string
  event_type: string
  acted: boolean
  suggested_action?: string
  metadata?: any
  detected_at?: string
  action_at?: string
}

export interface AgentFeedback {
  id: string
  user_id: string
  conversation_id?: string
  rating: number
  feedback_text?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  created_at?: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Service input types
export interface CreateContractInput {
  user_id: string
  employer_name: string
  position: string
  salary: number
  start_date: string
  contract_type: string
}

export interface UpdateResumeInput {
  job_title?: string
  skills?: string[]
  experience_years?: number
  education?: string
  summary?: string
}

export interface AddCourseInput {
  resume_id: string
  course_name: string
  provider: string
  date_completed: string
  certificate_url?: string
}

export interface BookAppointmentInput {
  user_id: string
  appointment_type: string
  appointment_date: string
  notes?: string
}

export interface GenerateCertificateInput {
  user_id: string
  certificate_type: 'salary_definition' | 'service_certificate' | 'labor_license'
}

// Agent action types
export interface AgentActionPayload {
  user_id?: string
  contract_id?: string
  appointment_id?: string
  resume_id?: string
  [key: string]: any
}

export interface AgentActionRequest extends AgentActionPayload {
  action: string
}

