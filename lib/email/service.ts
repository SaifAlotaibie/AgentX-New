import { resend } from './resend-client'
import {
    ticketOpenedTemplate,
    ticketClosedTemplate,
    contractExpiringTemplate,
    profileIncompleteTemplate,
    certificateIssuedTemplate
} from './templates'
import { db } from '@/lib/db/db'

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'

/**
 * Get user email from database
 */
async function getUserEmail(userId: string): Promise<string | null> {
    try {
        const { data, error } = await db
            .from('user_profile')
            .select('email, full_name, email_notifications_enabled')
            .eq('user_id', userId)
            .maybeSingle()

        if (error || !data) {
            console.error('❌ Failed to fetch user email:', error)
            return null
        }

        // Check if user has email notifications enabled
        if (data.email_notifications_enabled === false) {
            console.log('📧 Email notifications disabled for user:', userId)
            return null
        }

        if (!data.email) {
            console.log('⚠️ User has no email address:', userId)
            return null
        }

        return data.email
    } catch (error) {
        console.error('❌ Error fetching user email:', error)
        return null
    }
}

/**
 * Log email notification to database
 */
async function logEmailNotification(params: {
    userId: string
    notificationType: string
    emailTo: string


    subject: string
    status: 'sent' | 'failed'
    errorMessage?: string
}) {
    try {
        await db.from('email_notifications_log').insert({
            user_id: params.userId,
            notification_type: params.notificationType,
            email_to: params.emailTo,
            subject: params.subject,
            status: params.status,
            error_message: params.errorMessage || null
        })
    } catch (error) {
        console.error('❌ Failed to log email notification:', error)
    }
}

/**
 * Send Ticket Opened Email
 */
export async function sendTicketOpenedEmail(
    userId: string,
    ticketData: { ticket_number: string; title: string; category: string }
): Promise<void> {
    try {
        const userEmail = await getUserEmail(userId)
        if (!userEmail) return

        // Get user name
        const { data: profile } = await db
            .from('user_profile')
            .select('full_name')
            .eq('user_id', userId)
            .maybeSingle()

        const userName = profile?.full_name || 'عزيزي المستخدم'

        const { subject, html } = ticketOpenedTemplate({
            userName,
            ticketNumber: ticketData.ticket_number,
            ticketTitle: ticketData.title,
            ticketCategory: ticketData.category
        })

        console.log(`📧 Sending ticket opened email to ${userEmail}`)

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject,
            html
        })

        if (error) {
            console.error('❌ Failed to send email:', error)
            await logEmailNotification({
                userId,
                notificationType: 'ticket_opened',
                emailTo: userEmail,
                subject,
                status: 'failed',
                errorMessage: error.message
            })
        } else {
            console.log('✅ Email sent successfully:', data?.id)
            await logEmailNotification({
                userId,
                notificationType: 'ticket_opened',
                emailTo: userEmail,
                subject,
                status: 'sent'
            })
        }
    } catch (error: any) {
        console.error('❌ Error in sendTicketOpenedEmail:', error)
    }
}

/**
 * Send Ticket Closed Email
 */
export async function sendTicketClosedEmail(
    userId: string,
    ticketData: { ticket_number: string; title: string; resolution?: string }
): Promise<void> {
    try {
        const userEmail = await getUserEmail(userId)
        if (!userEmail) return

        const { data: profile } = await db
            .from('user_profile')
            .select('full_name')
            .eq('user_id', userId)
            .maybeSingle()

        const userName = profile?.full_name || 'عزيزي المستخدم'

        const { subject, html } = ticketClosedTemplate({
            userName,
            ticketNumber: ticketData.ticket_number,
            ticketTitle: ticketData.title,
            resolution: ticketData.resolution
        })

        console.log(`📧 Sending ticket closed email to ${userEmail}`)

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject,
            html
        })

        if (error) {
            console.error('❌ Failed to send email:', error)
            await logEmailNotification({
                userId,
                notificationType: 'ticket_closed',
                emailTo: userEmail,
                subject,
                status: 'failed',
                errorMessage: error.message
            })
        } else {
            console.log('✅ Email sent successfully:', data?.id)
            await logEmailNotification({
                userId,
                notificationType: 'ticket_closed',
                emailTo: userEmail,
                subject,
                status: 'sent'
            })
        }
    } catch (error: any) {
        console.error('❌ Error in sendTicketClosedEmail:', error)
    }
}

/**
 * Send Contract Expiring Email
 */
export async function sendContractExpiringEmail(
    userId: string,
    contractData: {
        employer_name: string
        position: string
        end_date: string
    },
    daysRemaining: number
): Promise<void> {
    try {
        const userEmail = await getUserEmail(userId)
        if (!userEmail) return

        const { data: profile } = await db
            .from('user_profile')
            .select('full_name')
            .eq('user_id', userId)
            .maybeSingle()

        const userName = profile?.full_name || 'عزيزي المستخدم'

        const { subject, html } = contractExpiringTemplate({
            userName,
            employerName: contractData.employer_name,
            position: contractData.position,
            endDate: contractData.end_date,
            daysRemaining
        })

        console.log(`📧 Sending contract expiring email to ${userEmail}`)

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject,
            html
        })

        if (error) {
            console.error('❌ Failed to send email:', error)
            await logEmailNotification({
                userId,
                notificationType: 'contract_expiring',
                emailTo: userEmail,
                subject,
                status: 'failed',
                errorMessage: error.message
            })
        } else {
            console.log('✅ Email sent successfully:', data?.id)
            await logEmailNotification({
                userId,
                notificationType: 'contract_expiring',
                emailTo: userEmail,
                subject,
                status: 'sent'
            })
        }
    } catch (error: any) {
        console.error('❌ Error in sendContractExpiringEmail:', error)
    }
}

/**
 * Send Profile Incomplete Email
 */
export async function sendProfileIncompleteEmail(
    userId: string,
    missingFields: string[]
): Promise<void> {
    try {
        const userEmail = await getUserEmail(userId)
        if (!userEmail) return

        const { data: profile } = await db
            .from('user_profile')
            .select('full_name')
            .eq('user_id', userId)
            .maybeSingle()

        const userName = profile?.full_name || 'عزيزي المستخدم'

        const { subject, html } = profileIncompleteTemplate({
            userName,
            missingFields
        })

        console.log(`📧 Sending profile incomplete email to ${userEmail}`)

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject,
            html
        })

        if (error) {
            console.error('❌ Failed to send email:', error)
            await logEmailNotification({
                userId,
                notificationType: 'profile_incomplete',
                emailTo: userEmail,
                subject,
                status: 'failed',
                errorMessage: error.message
            })
        } else {
            console.log('✅ Email sent successfully:', data?.id)
            await logEmailNotification({
                userId,
                notificationType: 'profile_incomplete',
                emailTo: userEmail,
                subject,
                status: 'sent'
            })
        }
    } catch (error: any) {
        console.error('❌ Error in sendProfileIncompleteEmail:', error)
    }
}

/**
 * Send Certificate Issued Email
 */
export async function sendCertificateIssuedEmail(
    userId: string,
    certificateData: {
        certificate_type: string
        issue_date: string
    }
): Promise<void> {
    try {
        const userEmail = await getUserEmail(userId)
        if (!userEmail) return

        const { data: profile } = await db
            .from('user_profile')
            .select('full_name')
            .eq('user_id', userId)
            .maybeSingle()

        const userName = profile?.full_name || 'عزيزي المستخدم'

        const certificateTypeMap: Record<string, string> = {
            salary_definition: 'شهادة تعريف براتب',
            service_certificate: 'شهادة خدمة',
            labor_license: 'ترخيص عمل'
        }

        const { subject, html } = certificateIssuedTemplate({
            userName,
            certificateType: certificateTypeMap[certificateData.certificate_type] || certificateData.certificate_type,
            issueDate: certificateData.issue_date
        })

        console.log(`📧 Sending certificate issued email to ${userEmail}`)

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject,
            html
        })

        if (error) {
            console.error('❌ Failed to send email:', error)
            await logEmailNotification({
                userId,
                notificationType: 'certificate_issued',
                emailTo: userEmail,
                subject,
                status: 'failed',
                errorMessage: error.message
            })
        } else {
            console.log('✅ Email sent successfully:', data?.id)
            await logEmailNotification({
                userId,
                notificationType: 'certificate_issued',
                emailTo: userEmail,
                subject,
                status: 'sent'
            })
        }
    } catch (error: any) {
        console.error('❌ Error in sendCertificateIssuedEmail:', error)
    }
}
