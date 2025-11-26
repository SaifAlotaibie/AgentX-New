# AgentX Database Schema Reference

This document serves as the **Single Source of Truth** for the AgentX database schema. It reflects the actual requirements of the codebase AND future planned features.

> [!IMPORTANT]
> If you change the schema, you MUST update this document and `database-schema.sql`.

## 🚨 Critical Dependencies (What Needs What & Why)
This section explains exactly why specific columns are required by the codebase. **Missing these will cause the Agent to crash.**

| Table | Column | Required By (Tool) | Why it is needed? |
|-------|--------|--------------------|-------------------|
| `user_profile` | `national_id` | `certificateTools.ts` | **CRITICAL:** Required to generate official salary certificates. The tool fails if this is missing. |
| `user_profile` | `job_title` | `resumeTools.ts` | **CRITICAL:** Used as the header for generated resumes. |
| `tickets` | `category` | `ticketTools.ts` | **CRITICAL:** The agent categorizes tickets (e.g., "agent_action") to track its own work. |
| `user_behavior` | `interaction_count` | `logger.ts` | **ANALYTICS:** Used to track how engaged a user is. |
| `proactive_events` | `action_taken` | `logger.ts` | **LOGIC:** Prevents the agent from suggesting the same action twice. |

## 1. User Profile (`user_profile`)
Stores core user information.

| Column | Type | Description | Code Reference |
|--------|------|-------------|----------------|
| `user_id` | UUID | Primary Key | Everywhere |
| `full_name` | TEXT | User's full name | `profileTools.ts` |
| `national_id` | TEXT | **[ADDED]** National ID number | [certificateTools.ts](file:///C:/Users/Azzam/PycharmProjects/AgentX/app/ai/tools/certificateTools.ts) |
| `job_title` | TEXT | **[ADDED]** Current job title | [resumeTools.ts](file:///C:/Users/Azzam/PycharmProjects/AgentX/app/ai/tools/resumeTools.ts) |
| `preferred_language` | TEXT | **[FUTURE]** 'ar' or 'en' | *Planned Feature* |
| `email` | TEXT | Contact email | `profileTools.ts` |
| `nationality` | TEXT | Default: 'سعودي' | `profileTools.ts` |

## 2. Tickets (`tickets`)
Manages support tickets created by the agent.

| Column | Type | Description | Code Reference |
|--------|------|-------------|----------------|
| `id` | UUID | Primary Key | `ticketTools.ts` |
| `ticket_number` | SERIAL | Auto-incrementing ID | `ticketTools.ts` |
| `category` | TEXT | **[ADDED]** Ticket category | [ticketTools.ts](file:///C:/Users/Azzam/PycharmProjects/AgentX/app/ai/tools/ticketTools.ts) |
| `merged_with_ticket_id`| UUID | **[FUTURE]** For deduplication | *Planned Feature* |
| `status` | TEXT | 'open' or 'closed' | `ticketTools.ts` |

## 3. User Behavior (`user_behavior`)
Tracks user interactions for analytics and personalization.

| Column | Type | Description | Code Reference |
|--------|------|-------------|----------------|
| `user_id` | UUID | FK to user_profile | `logger.ts` |
| `interaction_count` | INTEGER | **[ADDED]** Total messages | [logger.ts](file:///C:/Users/Azzam/PycharmProjects/AgentX/app/ai/tools/logger.ts) |
| `last_seen_service` | TEXT | **[ADDED]** Last tool used | [logger.ts](file:///C:/Users/Azzam/PycharmProjects/AgentX/app/ai/tools/logger.ts) |
| `success_rate` | NUMERIC | **[ADDED]** Task success % | `logger.ts` |

## 4. Proactive Events (`proactive_events`)
Stores events detected by the proactive system.

| Column | Type | Description | Code Reference |
|--------|------|-------------|----------------|
| `event_type` | TEXT | Type of event | `proactiveTools.ts` |
| `action_taken` | TEXT | **[ADDED]** Action performed | [logger.ts](file:///C:/Users/Azzam/PycharmProjects/AgentX/app/ai/tools/logger.ts) |
| `acted` | BOOLEAN | Whether acted upon | `logger.ts` |

## 5. Resumes (`resumes`)
Stores user resumes.

| Column | Type | Description | Code Reference |
|--------|------|-------------|----------------|
| `id` | UUID | Primary Key | `resumeTools.ts` |
| `job_title` | TEXT | Job title | `resumeTools.ts` |
| `file_url` | TEXT | **[FUTURE]** Uploaded PDF URL | *Planned Feature* |
| `parsed_content` | JSONB | **[FUTURE]** AI extracted data | *Planned Feature* |

## 6. Conversations (`conversations`)
Stores chat history.

| Column | Type | Description | Code Reference |
|--------|------|-------------|----------------|
| `id` | UUID | Primary Key | `executor-agentic.ts` |
| `content` | TEXT | Message text | `executor-agentic.ts` |
| `metadata` | JSONB | **[FUTURE]** Voice/Sentiment data | *Planned Feature* |

## 7. Agent Actions Log (`agent_actions_log`)
Logs all tool executions.

| Column | Type | Description | Code Reference |
|--------|------|-------------|----------------|
| `user_id` | TEXT | **[MISMATCH]** Currently TEXT in DB, should be UUID | `logger.ts` |
| `action_type` | TEXT | Tool name | `logger.ts` |
| `success` | BOOLEAN | Execution status | `logger.ts` |

## Migration Guide
To bring your Supabase database in sync with this schema:
1. Open Supabase SQL Editor.
2. Run the contents of [database-schema-FIXED.sql](file:///C:/Users/Azzam/PycharmProjects/AgentX/database-schema-FIXED.sql).
