export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export interface Tool {
  name: string
  description: string
  parameters: Record<string, string>
  execute: (params: any) => Promise<ToolResult>
}

export interface ProactiveEvent {
  id?: string
  user_id: string
  event_type: string
  metadata: any
  detected_at?: string
  acted?: boolean
  action_taken?: string | null
  action_at?: string | null
}
