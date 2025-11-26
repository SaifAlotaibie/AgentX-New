// Rule-Based Proactive Triggers

import { db } from '@/lib/db/db'
import { createProactiveEvent } from '../tools/logger'

export interface ProactiveTrigger {
  check: () => Promise<ProactiveEvent[]>
  name: string
}

export interface ProactiveEvent {
  user_id: string
  event_type: string
  metadata: any
  suggested_action: string
}

// Trigger 1: Contract Expiry Warning
export const contractExpiryTrigger: ProactiveTrigger = {
  name: 'contract_expiry_check',
  check: async () => {
    const events: ProactiveEvent[] = []

    const { data: contracts } = await db
      .from('employment_contracts')
      .select('*, user_profile(full_name)')
      .eq('status', 'active')

    if (!contracts) return events

    for (const contract of contracts) {
      if (!contract.end_date) continue

      const endDate = new Date(contract.end_date)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        events.push({
          user_id: contract.user_id,
          event_type: 'contract_expiring_soon',
          metadata: {
            contract_id: contract.id,
            employer_name: contract.employer_name,
            position: contract.position,
            end_date: contract.end_date,
            days_until_expiry: daysUntilExpiry
          },
          suggested_action: `عقدك مع ${contract.employer_name} ينتهي خلال ${daysUntilExpiry} يوم. هل تريد تجديده؟`
        })

        await createProactiveEvent(
          contract.user_id,
          'contract_expiring_soon',
          { contract_id: contract.id, days_until_expiry: daysUntilExpiry }
          // Don't set action_taken - event should remain unacted until user responds
        )
      }
    }

    return events
  }
}

// Trigger 2: Appointment Reminders
export const appointmentReminderTrigger: ProactiveTrigger = {
  name: 'appointment_reminder_check',
  check: async () => {
    const events: ProactiveEvent[] = []

    const { data: appointments } = await db
      .from('labor_appointments')
      .select('*')
      .eq('status', 'scheduled')

    if (!appointments) return events

    for (const appointment of appointments) {
      const aptDate = new Date(appointment.date)
      const now = new Date()
      const daysUntil = Math.ceil((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil <= 3 && daysUntil >= 0) {
        events.push({
          user_id: appointment.user_id,
          event_type: 'upcoming_appointment',
          metadata: {
            appointment_id: appointment.id,
            office_location: appointment.office_location,
            date: appointment.date,
            time: appointment.time,
            days_until: daysUntil
          },
          suggested_action: `لديك موعد في ${appointment.office_location} يوم ${appointment.date} الساعة ${appointment.time}. لا تنسى!`
        })

        await createProactiveEvent(
          appointment.user_id,
          'appointment_reminder',
          { appointment_id: appointment.id, days_until: daysUntil }
          // Don't set action_taken - event should remain unacted until user responds
        )
      }
    }

    return events
  }
}

// Trigger 3: Open Tickets Follow-up
export const ticketFollowUpTrigger: ProactiveTrigger = {
  name: 'ticket_follow_up_check',
  check: async () => {
    const events: ProactiveEvent[] = []

    const { data: tickets } = await db
      .from('tickets')
      .select('*')
      .eq('status', 'open')

    if (!tickets) return events

    for (const ticket of tickets) {
      const createdDate = new Date(ticket.created_at)
      const now = new Date()
      const daysSinceCreation = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceCreation >= 3) {
        events.push({
          user_id: ticket.user_id,
          event_type: 'ticket_follow_up_needed',
          metadata: {
            ticket_id: ticket.id,
            ticket_number: ticket.ticket_number,
            title: ticket.title,
            days_open: daysSinceCreation
          },
          suggested_action: `تذكرتك رقم ${ticket.ticket_number} "${ticket.title}" مفتوحة منذ ${daysSinceCreation} يوم. هل تحتاج متابعة؟`
        })

        // Save to database so it can be retrieved later
        await createProactiveEvent(
          ticket.user_id,
          'ticket_follow_up_needed',
          { ticket_id: ticket.id, ticket_number: ticket.ticket_number, days_open: daysSinceCreation }
          // Don't set action_taken - event should remain unacted until user responds
        )
      }
    }

    return events
  }
}

// Trigger 4: User Dissatisfaction Detection
export const dissatisfactionTrigger: ProactiveTrigger = {
  name: 'dissatisfaction_check',
  check: async () => {
    const events: ProactiveEvent[] = []

    const { data: behaviors } = await db
      .from('user_behavior')
      .select('*')
      .gte('consecutive_complaints_count', 2)

    if (!behaviors) return events

    for (const behavior of behaviors) {
      events.push({
        user_id: behavior.user_id,
        event_type: 'user_dissatisfaction_detected',
        metadata: {
          consecutive_complaints: behavior.consecutive_complaints_count,
          last_feedback_score: behavior.feedback_score,
          last_message: behavior.last_message
        },
        suggested_action: 'نلاحظ عدم رضاك عن الخدمة. هل يمكننا مساعدتك بشكل أفضل؟ نقدر ملاحظاتك.'
      })

      await createProactiveEvent(
        behavior.user_id,
        'user_dissatisfaction_detected',
        { consecutive_complaints: behavior.consecutive_complaints_count }
        // Don't set action_taken - event should remain unacted until user responds
      )
    }

    return events
  }
}

// Trigger 5: Incomplete Resume Detection
export const incompleteResumeTrigger: ProactiveTrigger = {
  name: 'incomplete_resume_check',
  check: async () => {
    const events: ProactiveEvent[] = []

    const { data: resumes } = await db
      .from('resumes')
      .select('*, resume_courses(count)')

    if (!resumes) return events

    for (const resume of resumes) {
      const isIncomplete =
        !resume.headline ||
        !resume.summary ||
        !resume.skills ||
        resume.skills.length === 0 ||
        !resume.experience_years

      if (isIncomplete) {
        events.push({
          user_id: resume.user_id,
          event_type: 'incomplete_resume_detected',
          metadata: {
            resume_id: resume.id,
            missing_fields: {
              headline: !resume.headline,
              summary: !resume.summary,
              skills: !resume.skills || resume.skills.length === 0,
              experience: !resume.experience_years
            }
          },
          suggested_action: 'سيرتك الذاتية غير مكتملة. أكمل المعلومات الناقصة لزيادة فرص التوظيف!'
        })

        // Save to database so it can be retrieved later
        await createProactiveEvent(
          resume.user_id,
          'incomplete_resume_detected',
          { resume_id: resume.id }
          // Don't set action_taken - event should remain unacted until user responds
        )
      }
    }

    return events
  }
}

// Main trigger executor
export async function executeAllTriggers(): Promise<ProactiveEvent[]> {
  const triggers = [
    contractExpiryTrigger,
    appointmentReminderTrigger,
    ticketFollowUpTrigger,
    dissatisfactionTrigger,
    incompleteResumeTrigger
  ]

  const allEvents: ProactiveEvent[] = []

  for (const trigger of triggers) {
    try {
      console.log(`[Proactive] Executing trigger: ${trigger.name}`)
      const events = await trigger.check()
      allEvents.push(...events)
      console.log(`[Proactive] ${trigger.name} generated ${events.length} events`)
    } catch (err) {
      console.error(`[Proactive] Error in trigger ${trigger.name}:`, err)
    }
  }

  return allEvents
}

