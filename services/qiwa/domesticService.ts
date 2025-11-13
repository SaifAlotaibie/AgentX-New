import { findByUser, insert, update } from '@/lib/db/db'
import { DomesticLaborRequest } from '@/lib/db/types'

export async function getDomesticRequests(user_id: string): Promise<DomesticLaborRequest[]> {
  return await findByUser<DomesticLaborRequest>('domestic_labor_requests', user_id)
}

export async function createDomesticRequest(
  user_id: string,
  request_type: string,
  worker_nationality: string,
  request_details: any
): Promise<DomesticLaborRequest | null> {
  const requestData = {
    user_id,
    request_type,
    worker_nationality,
    status: 'pending',
    request_details,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return await insert<DomesticLaborRequest>('domestic_labor_requests', requestData)
}

export async function updateRequestStatus(
  request_id: string,
  status: 'pending' | 'approved' | 'rejected' | 'completed'
): Promise<DomesticLaborRequest | null> {
  return await update<DomesticLaborRequest>(
    'domestic_labor_requests',
    { id: request_id },
    {
      status,
      updated_at: new Date().toISOString()
    }
  )
}


