import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://womyztswwrnyazqglryg.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvbXl6dHN3d3JueWF6cWdscnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTAzMDgsImV4cCI6MjA3ODUyNjMwOH0.C-DRpZva7Xc5agXOmXb1sIQzlv89tXyH_gebcmLll1Q"

export const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// UUID validation regex (RFC 4122 compliant - all versions)
// Accepts UUID v1-v5 to match PostgreSQL's UUID type
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
 * Validates user_id before database operations
 * Throws error if invalid UUID to prevent database errors
 * @param user_id - User ID to validate
 * @throws Error if user_id is not a valid UUID
 */
function validateUserId(user_id: string): void {
  if (!isValidUUID(user_id)) {
    throw new Error(`Invalid user_id: "${user_id}". Must be a valid UUID.`)
  }
}

// Generic DAL helpers
export async function findById<T>(table: string, id: string): Promise<T | null> {
  const { data, error } = await db
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Error finding by id in ${table}:`, error)
    return null
  }

  return data as T
}

export async function findByUser<T>(table: string, user_id: string): Promise<T[]> {
  // Validate user_id before query
  validateUserId(user_id)
  
  const { data, error } = await db
    .from(table)
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Error finding by user in ${table}:`, error)
    return []
  }

  return (data || []) as T[]
}

export async function findAll<T>(table: string): Promise<T[]> {
  const { data, error } = await db
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Error finding all in ${table}:`, error)
    return []
  }

  return (data || []) as T[]
}

export async function insert<T>(table: string, data: any): Promise<T | null> {
  const { data: result, error } = await db
    .from(table)
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error(`Error inserting into ${table}:`, error)
    return null
  }

  return result as T
}

export async function update<T>(table: string, match: Record<string, any>, data: any): Promise<T | null> {
  let query = db.from(table).update(data)

  Object.keys(match).forEach(key => {
    query = query.eq(key, match[key])
  })

  const { data: result, error } = await query.select().single()

  if (error) {
    console.error(`Error updating ${table}:`, error)
    return null
  }

  return result as T
}

export async function remove(table: string, match: Record<string, any>): Promise<boolean> {
  let query = db.from(table).delete()

  Object.keys(match).forEach(key => {
    query = query.eq(key, match[key])
  })

  const { error } = await query

  if (error) {
    console.error(`Error deleting from ${table}:`, error)
    return false
  }

  return true
}

