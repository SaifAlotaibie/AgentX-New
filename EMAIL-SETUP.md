# Email Notification Setup Guide

## 🎯 Overview
AgentX uses **Resend** for sending automated email notifications with official HRSD/Qiwa branding in Arabic.

## 📧 Email Notifications

The system automatically sends emails for:
- ✅ Ticket opened/closed
- ✅ Contract expiring (30/15/7 days)
- ✅ Profile incomplete reminders
- ✅ Certificate issued

All emails feature:
- Full Arabic RTL support
- HRSD/Qiwa official branding
- Ministry colors (#0A74A6, #0098D4, #053321)
- Professional government design

## 🚀 Setup Instructions

### 1. Get Resend API Key

1. Visit [resend.com](https://resend.com) and create a free account
2. Go to API Keys section
3. Generate a new API key
4. Copy the key (starts with `re_`)

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```

**For Testing:** Use `onboarding@resend.dev` as FROM_EMAIL

**For Production:** 
1. Verify your domain in Resend dashboard
2. Change FROM_EMAIL to `noreply@qiwa.gov.sa` (or your verified domain)

### 3. Run Database Migration

Run the email notifications schema in Supabase SQL Editor:

```sql
-- Located in: lib/email/schema.sql
CREATE TABLE IF NOT EXISTS email_notifications_log (...);
ALTER TABLE user_profile ADD COLUMN email_notifications_enabled...;
```

### 4. Add User Email Addresses

Ensure users have valid email addresses in `user_profile`:

```sql
UPDATE user_profile 
SET email = 'user@example.com' 
WHERE user_id = 'your-user-id';
```

## 🧪 Testing

### Test Email Notification

1. Make sure you have:
   - Valid `RESEND_API_KEY` in `.env.local`
   - Your email in `user_profile` table
   
2. Create a ticket via the agent:
   ```
   User: "افتح تذكرة دعم بعنوان 'اختبار'"
   ```

3. Check your inbox - you should receive a branded Arabic email!

### Test All Templates

- **Ticket Opened**: Create any ticket
- **Ticket Closed**: Close an existing ticket
- **Contract Expiring**: Will trigger automatically when detecting expiring contracts
- **Profile Incomplete**: Will trigger automatically for users with missing info

## 🎨 Email Design

All emails follow HRSD/Qiwa branding:

```
┌─────────────────────────────────────┐
│  🏛️ منصة قوى                         │ ← Header (#0A74A6)
│  وزارة الموارد البشرية              │
├─────────────────────────────────────┤
│  مرحباً عزام،                        │ ← RTL Content
│  [Notification Details]              │
│  [عرض التfاصيل] ← Button (#0098D4)   │
├─────────────────────────────────────┤
│  وزارة الموارد البشرية              │ ← Footer (#053321)
│  المملكة العربية السعودية           │
└─────────────────────────────────────┘
```

## 📊 User Preferences

Users can disable email notifications by updating their profile:

```sql
UPDATE user_profile 
SET email_notifications_enabled = false 
WHERE user_id = 'user-id';
```

Granular preferences (optional):
```sql
UPDATE user_profile 
SET notification_preferences = '{"tickets": true, "contracts": false, "profile": true}'::jsonb
WHERE user_id = 'user-id';
```

## 📝 Monitoring

View sent emails log:

```sql
SELECT * FROM email_notifications_log 
ORDER BY sent_at DESC 
LIMIT 10;
```

Check failed emails:

```sql
SELECT * FROM email_notifications_log 
WHERE status = 'failed' 
ORDER BY sent_at DESC;
```

## 🔧 Troubleshooting

**Email not sending?**
- Check `RESEND_API_KEY` is correct
- Verify user has email in `user_profile`
- Check `email_notifications_enabled = true`
- Look for errors in server logs

**Email goes to spam?**
- For production, verify your domain in Resend
- Use official `noreply@qiwa.gov.sa` sender
- Ensure SPF/DKIM records are set up

## 💰 Pricing

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for demos and testing

**Paid plans start at $20/month for higher volumes**

## 🎬 Demo Tips

When presenting to Ministry Director:
1. Show email on mobile phone (responsive design)
2. Highlight Arabic RTL perfection
3. Point out official HRSD/Qiwa branding
4. Emphasize automatic and proactive nature

---

**Created by AgentX Team**
