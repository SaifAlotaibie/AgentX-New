import { Tool, ToolResult } from './types'
import { findByUser, findById, insert, update } from '@/lib/db/db'
import { LaborAppointment } from '@/lib/db/types'
import { logAgentAction, updateUserBehavior } from './logger'
import { createTicketTool } from './ticketTools'

/**
 * Get Appointments Tool
 */
export const getAppointmentsTool: Tool = {
  name: 'getAppointmentsTool',
  description: 'جلب جميع مواعيد مكاتب العمل للمستخدم',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    status: 'حالة الموعد (اختياري): scheduled, completed, canceled',
  },
  execute: async (params: { user_id: string; status?: string }): Promise<ToolResult> => {
    try {
      const { user_id, status } = params

      let appointments = await findByUser<LaborAppointment>('labor_appointments', user_id)
      
      if (status) {
        appointments = appointments.filter(a => a.status === status)
      }

      await updateUserBehavior(user_id, {
        last_seen_service: 'appointments'
      })

      return {
        success: true,
        data: appointments || [],
        message: 'تم جلب المواعيد بنجاح'
      }
    } catch (error: any) {
      console.error('Error in getAppointmentsTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب المواعيد'
      }
    }
  }
}

/**
 * Schedule Appointment Tool
 * Auto-creates ticket after scheduling
 */
export const scheduleAppointmentTool: Tool = {
  name: 'scheduleAppointmentTool',
  description: 'حجز موعد في مكتب العمل',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    office_location: 'موقع مكتب العمل',
    date: 'تاريخ الموعد (YYYY-MM-DD)',
    time: 'وقت الموعد (مثال: 10:00 AM)',
  },
  execute: async (params: {
    user_id: string
    office_location: string
    date: string
    time: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, office_location, date, time } = params

      // Validate required fields
      if (!office_location || !date || !time) {
        return {
          success: false,
          error: 'جميع الحقول مطلوبة (موقع المكتب، التاريخ، الوقت)'
        }
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(date)) {
        return {
          success: false,
          error: 'تنسيق التاريخ غير صحيح. يجب أن يكون YYYY-MM-DD'
        }
      }

      // Check if date is in the future
      const appointmentDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (appointmentDate < today) {
        return {
          success: false,
          error: 'لا يمكن حجز موعد في تاريخ ماضي'
        }
      }

      // Create appointment
      const appointmentData = {
        user_id,
        office_location,
        date,
        time,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }

      const result: any = await insert('labor_appointments', appointmentData)

      // Log action
      await logAgentAction(user_id, 'schedule_appointment', params, result)

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'appointments'
      })

      // Auto-create ticket (MANDATORY)
      await createTicketTool.execute({
        user_id,
        title: 'حجز موعد مكتب العمل عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم حجز موعد في ${office_location} بتاريخ ${date} الساعة ${time}`
      })

      return {
        success: true,
        data: result?.data || result,
        message: 'تم حجز الموعد بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('Error in scheduleAppointmentTool:', error)
      return {
        success: false,
        error: error.message || 'فشل حجز الموعد'
      }
    }
  }
}

/**
 * Cancel Appointment Tool
 * Auto-creates ticket after cancellation
 */
export const cancelAppointmentTool: Tool = {
  name: 'cancelAppointmentTool',
  description: 'إلغاء موعد مكتب العمل',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    appointment_id: 'معرف الموعد (UUID)',
  },
  execute: async (params: {
    user_id: string
    appointment_id: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, appointment_id } = params

      // Check if appointment exists
      const appointment = await findById<LaborAppointment>('labor_appointments', appointment_id)
      
      if (!appointment) {
        return {
          success: false,
          error: 'الموعد غير موجود'
        }
      }

      if (appointment.user_id !== user_id) {
        return {
          success: false,
          error: 'ليس لديك صلاحية لإلغاء هذا الموعد'
        }
      }

      if (appointment.status === 'cancelled') {
        return {
          success: false,
          error: 'الموعد ملغى بالفعل'
        }
      }

      if (appointment.status === 'completed') {
        return {
          success: false,
          error: 'لا يمكن إلغاء موعد مكتمل'
        }
      }

      // Cancel appointment
      const result: any = await update('labor_appointments', { id: appointment_id }, {
        status: 'cancelled'
      })

      // Log action
      await logAgentAction(user_id, 'cancel_appointment', params, result)

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'appointments'
      })

      // Auto-create ticket (MANDATORY)
      await createTicketTool.execute({
        user_id,
        title: 'إلغاء موعد مكتب العمل عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم إلغاء موعد في ${appointment.office_location} بتاريخ ${appointment.date} الساعة ${appointment.time}`
      })

      return {
        success: true,
        data: result.data,
        message: 'تم إلغاء الموعد بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('Error in cancelAppointmentTool:', error)
      return {
        success: false,
        error: error.message || 'فشل إلغاء الموعد'
      }
    }
  }
}
