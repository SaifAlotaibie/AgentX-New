import { findByUser, findById, insert, update } from '@/lib/db/db'
import { LaborAppointment, BookAppointmentInput } from '@/lib/db/types'

export async function getAppointments(user_id: string): Promise<LaborAppointment[]> {
  return await findByUser<LaborAppointment>('labor_appointments', user_id)
}

export async function getAppointmentById(appointment_id: string): Promise<LaborAppointment | null> {
  return await findById<LaborAppointment>('labor_appointments', appointment_id)
}

export async function bookAppointment(user_id: string, appointmentData: Omit<BookAppointmentInput, 'user_id'>): Promise<LaborAppointment | null> {
  const data = {
    user_id,
    ...appointmentData,
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return await insert<LaborAppointment>('labor_appointments', data)
}

export async function cancelAppointment(appointment_id: string): Promise<LaborAppointment | null> {
  const appointment = await findById<LaborAppointment>('labor_appointments', appointment_id)

  if (!appointment) {
    throw new Error('Appointment not found')
  }

  if (appointment.status === 'cancelled') {
    throw new Error('Appointment already cancelled')
  }

  if (appointment.status === 'completed') {
    throw new Error('Cannot cancel completed appointment')
  }

  return await update<LaborAppointment>(
    'labor_appointments',
    { id: appointment_id },
    {
      status: 'cancelled',
      updated_at: new Date().toISOString()
    }
  )
}

export async function completeAppointment(appointment_id: string): Promise<LaborAppointment | null> {
  return await update<LaborAppointment>(
    'labor_appointments',
    { id: appointment_id },
    {
      status: 'completed',
      updated_at: new Date().toISOString()
    }
  )
}


