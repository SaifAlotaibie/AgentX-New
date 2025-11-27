import { Tool, ToolResult } from './types'
import { insert, update, findById, findByUser } from '@/lib/db/db'
import { Ticket } from '@/lib/db/types'
import { logAgentAction, updateUserBehavior } from './logger'
import { sendTicketOpenedEmail, sendTicketClosedEmail } from '@/lib/email/service'

/**
 * Create Ticket Tool
 */
export const createTicketTool: Tool = {
  name: 'createTicketTool',
  description: 'فتح تذكرة دعم جديدة',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    title: 'عنوان التذكرة',
    category: 'تصنيف التذكرة',
    description: 'وصف التذكرة (اختياري)',
  },
  execute: async (params: {
    user_id: string
    title: string
    category: string
    description?: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, title, category, description } = params

      if (!user_id || !title || !category) {
        return {
          success: false,
          error: 'جميع الحقول مطلوبة (user_id, title, category)'
        }
      }

      const ticketData = {
        user_id,
        title,
        category,
        description: description || '',
        status: 'open',
        created_at: new Date().toISOString()
      }

      const result: any = await insert('tickets', ticketData)

      await logAgentAction(user_id, 'create_ticket', params, result)
      await updateUserBehavior(user_id, {
        last_seen_service: 'tickets',
      })

      // Send email notification (non-blocking)
      if (result.data) {
        sendTicketOpenedEmail(user_id, {
          ticket_number: result.data.ticket_number || result.data.id.substring(0, 8),
          title,
          category
        }).catch(err => console.error('Email notification failed:', err))
      }

      return {
        success: true,
        data: result.data,
        message: 'تم فتح التذكرة بنجاح'
      }
    } catch (error: any) {
      console.error('Error in createTicketTool:', error)
      return {
        success: false,
        error: error.message || 'فشل فتح التذكرة'
      }
    }
  }
}

/**
 * Close Ticket Tool
 */
export const closeTicketTool: Tool = {
  name: 'closeTicketTool',
  description: 'إغلاق تذكرة موجودة',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    ticket_id: 'معرف التذكرة (UUID)',
  },
  execute: async (params: {
    user_id: string
    ticket_id: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, ticket_id } = params

      const ticket = await findById<Ticket>('tickets', ticket_id)

      if (!ticket) {
        return {
          success: false,
          error: 'التذكرة غير موجودة'
        }
      }

      if (ticket.user_id !== user_id) {
        return {
          success: false,
          error: 'ليس لديك صلاحية لإغلاق هذه التذكرة'
        }
      }

      if (ticket.status === 'closed') {
        return {
          success: false,
          error: 'التذكرة مغلقة بالفعل'
        }
      }

      const result: any = await update('tickets', { id: ticket_id, user_id }, { status: 'closed' })

      await logAgentAction(user_id, 'close_ticket', params, result)
      await updateUserBehavior(user_id, {
        last_seen_service: 'tickets',
      })

      // Send email notification (non-blocking)
      sendTicketClosedEmail(user_id, {
        ticket_number: ticket.ticket_number || ticket_id.substring(0, 8),
        title: ticket.title
      }).catch(err => console.error('Email notification failed:', err))

      return {
        success: true,
        data: result.data,
        message: 'تم إغلاق التذكرة بنجاح'
      }
    } catch (error: any) {
      console.error('Error in closeTicketTool:', error)
      return {
        success: false,
        error: error.message || 'فشل إغلاق التذكرة'
      }
    }
  }
}

/**
 * Check Ticket Status Tool
 */
export const checkTicketStatusTool: Tool = {
  name: 'checkTicketStatusTool',
  description: 'فحص حالة تذكرة أو عرض جميع التذاكر',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    ticket_id: 'معرف التذكرة (اختياري)',
  },
  execute: async (params: {
    user_id: string
    ticket_id?: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, ticket_id } = params

      if (ticket_id) {
        // Get specific ticket
        const ticket = await findById<Ticket>('tickets', ticket_id)

        if (!ticket) {
          return {
            success: false,
            error: 'التذكرة غير موجودة'
          }
        }

        if (ticket.user_id !== user_id) {
          return {
            success: false,
            error: 'ليس لديك صلاحية لعرض هذه التذكرة'
          }
        }

        await updateUserBehavior(user_id, {
          last_seen_service: 'tickets',
        })

        return {
          success: true,
          data: ticket,
          message: `حالة التذكرة: ${ticket.status}`
        }
      } else {
        // Get all user tickets
        const tickets = await findByUser<Ticket>('tickets', user_id)

        await updateUserBehavior(user_id, {
          last_seen_service: 'tickets',
        })

        return {
          success: true,
          data: tickets || [],
          message: `لديك ${tickets?.length || 0} تذكرة`
        }
      }
    } catch (error: any) {
      console.error('Error in checkTicketStatusTool:', error)
      return {
        success: false,
        error: error.message || 'فشل فحص التذكرة'
      }
    }
  }
}
