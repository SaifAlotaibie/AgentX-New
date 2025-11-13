// Proactive Engine - Main Export

export * from './rule_based_triggers'
export * from './prediction_engine'

import { executeAllTriggers, ProactiveEvent } from './rule_based_triggers'
import { predictUserNeeds } from './prediction_engine'
import { db } from '@/lib/db/db'

// Main proactive engine interface
export interface ProactiveEngineResult {
  events: ProactiveEvent[]
  predictions: Map<string, any>
  actions_taken: number
}

// Execute full proactive sweep for a single user
export async function executeProactiveEngineForUser(user_id: string): Promise<ProactiveEngineResult> {
  const result: ProactiveEngineResult = {
    events: [],
    predictions: new Map(),
    actions_taken: 0
  }

  try {
    // 1. Run predictions
    const prediction = await predictUserNeeds(user_id)
    result.predictions.set(user_id, prediction)

    // 2. Run rule-based triggers
    const allEvents = await executeAllTriggers()
    const userEvents = allEvents.filter(e => e.user_id === user_id)
    result.events = userEvents

    // 3. Count actions
    result.actions_taken = userEvents.length + (prediction.confidence > 0.7 ? 1 : 0)

    console.log(`[Proactive Engine] User ${user_id}: ${userEvents.length} events, prediction: ${prediction.predicted_need}`)
  } catch (err) {
    console.error(`[Proactive Engine] Error for user ${user_id}:`, err)
  }

  return result
}

// Execute full proactive sweep for all active users
export async function executeProactiveEngineGlobal(): Promise<ProactiveEngineResult> {
  const result: ProactiveEngineResult = {
    events: [],
    predictions: new Map(),
    actions_taken: 0
  }

  try {
    console.log('[Proactive Engine] Starting global sweep...')

    // 1. Execute all rule-based triggers
    const allEvents = await executeAllTriggers()
    result.events = allEvents
    console.log(`[Proactive Engine] Generated ${allEvents.length} events`)

    // 2. Get active users (users who interacted in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeUsers } = await db
      .from('user_behavior')
      .select('user_id')
      .gte('updated_at', thirtyDaysAgo.toISOString())

    if (activeUsers && activeUsers.length > 0) {
      console.log(`[Proactive Engine] Running predictions for ${activeUsers.length} active users`)

      // 3. Run predictions for each active user
      for (const user of activeUsers) {
        try {
          const prediction = await predictUserNeeds(user.user_id)
          result.predictions.set(user.user_id, prediction)
        } catch (err) {
          console.error(`[Proactive Engine] Prediction failed for user ${user.user_id}:`, err)
        }
      }
    }

    result.actions_taken = result.events.length + result.predictions.size

    console.log(`[Proactive Engine] Sweep complete: ${result.events.length} events, ${result.predictions.size} predictions`)
  } catch (err) {
    console.error('[Proactive Engine] Global sweep error:', err)
  }

  return result
}

// Get proactive events for a specific user (for chatbot display)
export async function getProactiveEventsForUser(user_id: string, limit: number = 5): Promise<any[]> {
  try {
    const { data, error } = await db
      .from('proactive_events')
      .select('*')
      .eq('user_id', user_id)
      .eq('acted', false)
      .order('detected_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Proactive Engine] Error fetching user events:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('[Proactive Engine] Exception fetching user events:', err)
    return []
  }
}

// Mark proactive event as acted upon
export async function markProactiveEventActed(event_id: string, action_taken: string): Promise<boolean> {
  try {
    const { error } = await db
      .from('proactive_events')
      .update({
        acted: true,
        action_taken,
        action_at: new Date().toISOString()
      })
      .eq('id', event_id)

    if (error) {
      console.error('[Proactive Engine] Error marking event as acted:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[Proactive Engine] Exception marking event as acted:', err)
    return false
  }
}

