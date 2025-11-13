import { insert } from '@/lib/db/db'
import { AgentActionLog, AgentActionPayload } from '@/lib/db/types'
import * as contractsService from '@/services/qiwa/contractsService'
import * as certificatesService from '@/services/qiwa/certificatesService'
import * as appointmentsService from '@/services/qiwa/appointmentsService'
import * as resumeService from '@/services/qiwa/resumeService'

async function logAction(
  user_id: string,
  action_type: string,
  input_json: any,
  output_json: any,
  success: boolean
): Promise<void> {
  await insert<AgentActionLog>('agent_actions_log', {
    user_id,
    action_type,
    input_json,
    output_json,
    success,
    created_at: new Date().toISOString()
  })
}

export async function executeAgentAction(action: string, payload: AgentActionPayload): Promise<any> {
  const user_id = payload.user_id || ''
  let result: any
  let success = true

  try {
    switch (action) {
      case 'end_contract': {
        if (!payload.contract_id) {
          throw new Error('contract_id is required')
        }
        result = await contractsService.endContract(payload.contract_id)
        break
      }

      case 'generate_salary_certificate': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        result = await certificatesService.generateSalaryDefinition(payload.user_id)
        break
      }

      case 'generate_service_certificate': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        result = await certificatesService.generateServiceCertificate(payload.user_id)
        break
      }

      case 'generate_labor_license': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        result = await certificatesService.generateLaborLicense(payload.user_id)
        break
      }

      case 'book_appointment': {
        if (!payload.user_id || !payload.appointment_type || !payload.appointment_date) {
          throw new Error('user_id, appointment_type, and appointment_date are required')
        }
        result = await appointmentsService.bookAppointment(payload.user_id, {
          appointment_type: payload.appointment_type,
          appointment_date: payload.appointment_date,
          notes: payload.notes
        })
        break
      }

      case 'cancel_appointment': {
        if (!payload.appointment_id) {
          throw new Error('appointment_id is required')
        }
        result = await appointmentsService.cancelAppointment(payload.appointment_id)
        break
      }

      case 'update_resume': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        const resumeData = {
          job_title: payload.job_title,
          skills: payload.skills,
          experience_years: payload.experience_years,
          education: payload.education,
          summary: payload.summary
        }
        result = await resumeService.updateResume(payload.user_id, resumeData)
        break
      }

      case 'add_course': {
        if (!payload.resume_id || !payload.course_name || !payload.institution || !payload.completion_date) {
          throw new Error('resume_id, course_name, institution, and completion_date are required')
        }
        result = await resumeService.addCourse(payload.resume_id, {
          course_name: payload.course_name,
          institution: payload.institution,
          completion_date: payload.completion_date,
          certificate_url: payload.certificate_url
        })
        break
      }

      case 'get_contracts': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        result = await contractsService.getContracts(payload.user_id)
        break
      }

      case 'get_appointments': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        result = await appointmentsService.getAppointments(payload.user_id)
        break
      }

      case 'get_certificates': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        result = await certificatesService.getCertificates(payload.user_id)
        break
      }

      case 'get_resume': {
        if (!payload.user_id) {
          throw new Error('user_id is required')
        }
        result = await resumeService.getResumeWithCourses(payload.user_id)
        break
      }

      default:
        throw new Error(`Unknown agent action: ${action}`)
    }
  } catch (error: any) {
    success = false
    result = { error: error.message }
  }

  // Log the action
  await logAction(user_id, action, payload, result, success)

  if (!success) {
    throw new Error(result.error)
  }

  return result
}

export async function getAvailableActions(): Promise<string[]> {
  return [
    'end_contract',
    'generate_salary_certificate',
    'generate_service_certificate',
    'generate_labor_license',
    'book_appointment',
    'cancel_appointment',
    'update_resume',
    'add_course',
    'get_contracts',
    'get_appointments',
    'get_certificates',
    'get_resume'
  ]
}

