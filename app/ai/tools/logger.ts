// Tool Action Logger - logs all AI agent actions to Supabase

import { db } from '@/lib/db/db'

export async function logAgentAction(
  user_id: string,
  action_type: string,
  input_json: any,
  output_json: any
): Promise<boolean> {
  try {
    const { error } = await db
      .from('agent_actions_log')
      .insert({
        user_id,
        action_type,
        input_json,
        output_json,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging agent action:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception logging agent action:', err)
    return false
  }
}

export async function updateUserBehavior(
  user_id: string,
  updates: {
    last_message?: string
    predicted_need?: string
    intent?: string
    last_seen_service?: string
    needs_prediction?: string
  }
): Promise<boolean> {
  try {
    // Get current interaction count
    const { data: current } = await db
      .from('user_behavior')
      .select('interaction_count')
      .eq('user_id', user_id)
      .single()

    const newCount = (current?.interaction_count || 0) + 1

    const { error } = await db
      .from('user_behavior')
      .upsert({
        user_id,
        ...updates,
        updated_at: new Date().toISOString(),
        interaction_count: newCount
      })

    if (error) {
      console.error('Error updating user behavior:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception updating user behavior:', err)
    return false
  }
}

export async function createProactiveEvent(
  user_id: string,
  event_type: string,
  metadata: any,
  action_taken?: string
): Promise<boolean> {
  try {
    const { error } = await db
      .from('proactive_events')
      .insert({
        user_id,
        event_type,
        metadata,
        detected_at: new Date().toISOString(),
        acted: !!action_taken,
        action_taken,
        action_at: action_taken ? new Date().toISOString() : null
      })

    if (error) {
      console.error('Error creating proactive event:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception creating proactive event:', err)
    return false
  }
}

