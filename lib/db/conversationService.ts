/**
 * Conversation Service - Save and retrieve chat history
 */

import { db } from './db'
import { Conversation } from './types'

/**
 * Save a conversation message to database
 */
export async function saveConversation(
  user_id: string,
  role: 'user' | 'assistant',
  content: string
): Promise<boolean> {
  try {
    const { error } = await db
      .from('conversations')
      .insert({
        user_id,
        role,
        content,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Error saving conversation:', error)
      return false
    }

    console.log(`✅ Conversation saved: ${role} - ${content.substring(0, 50)}...`)
    return true
  } catch (err) {
    console.error('❌ Exception saving conversation:', err)
    return false
  }
}

/**
 * Get recent conversations for a user
 */
export async function getRecentConversations(
  user_id: string,
  limit: number = 20
): Promise<Conversation[]> {
  try {
    const { data, error } = await db
      .from('conversations')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching conversations:', error)
      return []
    }

    // Reverse to get chronological order
    return (data || []).reverse()
  } catch (err) {
    console.error('❌ Exception fetching conversations:', err)
    return []
  }
}

/**
 * Get conversation count for a user
 */
export async function getConversationCount(user_id: string): Promise<number> {
  try {
    const { count, error } = await db
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    if (error) {
      console.error('❌ Error counting conversations:', error)
      return 0
    }

    return count || 0
  } catch (err) {
    console.error('❌ Exception counting conversations:', err)
    return 0
  }
}

