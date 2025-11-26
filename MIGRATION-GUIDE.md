# 🛡️ Safe Migration Guide

Follow these steps to update your database without losing any data.

## 1. Why are we doing this?
Your code expects certain columns (`national_id`, `job_title`, etc.) to exist. Your current database is missing them. If we don't add them, features like **"Generate Certificate"** and **"Update Resume"** will crash.

## 2. Is it safe?
**YES.** The script `database-schema-FIXED.sql` uses `ADD COLUMN IF NOT EXISTS`.
- It **WILL** add missing columns.
- It **WILL NOT** delete any tables.
- It **WILL NOT** delete any existing data.
- It **WILL NOT** overwrite existing columns.

## 3. How to Run (Step-by-Step)

### Step 1: Open Supabase
Go to your [Supabase Dashboard](https://supabase.com/dashboard).

### Step 2: Open SQL Editor
Click on the **SQL Editor** icon (looks like a terminal `>_`) in the left sidebar.

### Step 3: Paste the Script
Copy the **entire content** of the file below and paste it into the SQL Editor:
`C:\Users\Azzam\PycharmProjects\AgentX\database-schema-FIXED.sql`

### Step 4: Run
Click the **Run** button (bottom right).

### Step 5: Verify
You should see a "Success" message. Your database is now synced with your code!

## 4. Future Proofing
We also added columns for future features so you won't need to do this again soon:
- `file_url` in `resumes` (for PDF uploads)
- `preferred_language` in `user_profile` (for English/Arabic support)
- `merged_with_ticket_id` in `tickets` (for deduplication)
