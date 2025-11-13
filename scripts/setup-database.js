/**
 * Database Setup Script
 * Run this to create all required tables in Supabase
 * 
 * Usage: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://womyztswwrnyazqglryg.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvbXl6dHN3d3JueWF6cWdscnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTAzMDgsImV4cCI6MjA3ODUyNjMwOH0.C-DRpZva7Xc5agXOmXb1sIQzlv89tXyH_gebcmLll1Q"

console.log('🔧 AgentX Database Setup')
console.log('========================\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkConnection() {
  console.log('📡 Testing Supabase connection...')
  
  try {
    // Try a simple query
    const { data, error } = await supabase
      .from('user_profile')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Table user_profile does not exist yet\n')
        return false
      }
      console.error('❌ Error:', error.message)
      return false
    }
    
    console.log('✅ Connected to Supabase successfully!\n')
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

async function showInstructions() {
  console.log('📋 SETUP INSTRUCTIONS')
  console.log('====================\n')
  console.log('To set up the database, follow these steps:\n')
  console.log('1. Open your Supabase dashboard:')
  console.log('   https://supabase.com/dashboard/project/womyztswwrnyazqglryg\n')
  console.log('2. Go to: SQL Editor (left sidebar)\n')
  console.log('3. Click: "+ New Query"\n')
  console.log('4. Copy ALL contents from: database-schema.sql\n')
  console.log('5. Paste into the SQL Editor\n')
  console.log('6. Click: "Run" (or press Ctrl+Enter)\n')
  console.log('7. Wait for success message\n')
  console.log('8. Restart your dev server: npm run dev\n')
  console.log('=' .repeat(60))
}

async function main() {
  const connected = await checkConnection()
  
  if (!connected) {
    await showInstructions()
    process.exit(1)
  }
  
  console.log('✅ Database is ready!')
  console.log('🚀 You can now run: npm run dev')
}

main()


