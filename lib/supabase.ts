import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://womyztswwrnyazqglryg.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvbXl6dHN3d3JueWF6cWdscnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTAzMDgsImV4cCI6MjA3ODUyNjMwOH0.C-DRpZva7Xc5agXOmXb1sIQzlv89tXyH_gebcmLll1Q"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Types
export interface UserProfile {
  user_id: string
  full_name: string
  phone?: string
  created_at?: string
}

// UUID validation regex (RFC 4122 compliant - all versions)
// Accepts UUID v1-v5 to match Supabase's UUID type
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validates if a string is a valid UUID (any version 1-5)
 * @param uuid - String to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false
  }
  return UUID_REGEX.test(uuid)
}

/**
 * Get or create a valid UUID v4 for the current user
 * - Always returns a valid UUID v4
 * - If localStorage contains an invalid UUID, it replaces it with a new valid one
 * - Thread-safe and type-safe
 * @returns Valid UUID v4 string
 */
export function getUserId(): string {
  // Server-side: return empty string (will be handled by client)
  if (typeof window === 'undefined') {
    return ''
  }

  // Try to get existing userId from localStorage
  let userId = localStorage.getItem('agentx_user_id')

  // Validate the userId
  if (!userId || !isValidUUID(userId)) {
    // Invalid or missing UUID - generate a new valid one
    if (userId && !isValidUUID(userId)) {
      console.warn(`⚠️ Invalid user_id detected in localStorage: "${userId}"`)
      console.log('🔧 Generating new valid UUID...')
    }

    // Generate new valid UUID v4
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        userId = crypto.randomUUID()
      } else {
        throw new Error('crypto.randomUUID not available')
      }
    } catch (e) {
      // Fallback for environments without crypto.randomUUID (e.g. insecure context)
      userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Save to localStorage
    localStorage.setItem('agentx_user_id', userId)

    console.log('✅ New user_id created:', userId)
  }

  return userId
}

// Helper: Check if user exists in Supabase
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    console.warn('getUserProfile: userId is empty')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // PGRST116 = No rows found (user doesn't exist yet)
      if (error.code === 'PGRST116') {
        console.log('✅ User profile not found (new user):', userId.substring(0, 8))
        return null
      }

      // 42P01 = Table doesn't exist
      if (error.code === '42P01') {
        console.error('❌ DATABASE ERROR: user_profile table does not exist!')
        console.error('📋 Please run database-schema.sql in Supabase SQL Editor')
        return null
      }

      // Other errors
      console.error('❌ Supabase error:', error.code, '-', error.message)
      if (error.hint) console.error('💡 Hint:', error.hint)
      if (error.details) console.error('📝 Details:', error.details)
      return null
    }

    return data
  } catch (error: any) {
    console.error('❌ Unexpected error fetching user profile:', error?.message || String(error))
    return null
  }
}

// Helper: Create new user profile
export async function createUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profile')
      .insert({
        user_id: profile.user_id,
        full_name: profile.full_name,
        phone: profile.phone || null
      })

    if (error) {
      // 42P01 = Table doesn't exist
      if (error.code === '42P01') {
        console.error('❌ DATABASE ERROR: user_profile table does not exist!')
        console.error('📋 Please run database-schema.sql in Supabase SQL Editor')
        return false
      }

      // 23505 = Unique violation (user already exists)
      if (error.code === '23505') {
        console.log('⚠️ User already exists, skipping insert')
        return true
      }

      console.error('❌ Supabase error creating user:', error.code, '-', error.message)
      if (error.hint) console.error('💡 Hint:', error.hint)
      if (error.details) console.error('📝 Details:', error.details)
      return false
    }

    console.log('✅ User profile created successfully')
    return true
  } catch (error: any) {
    console.error('❌ Unexpected error creating user profile:', error?.message || String(error))
    return false
  }
}

