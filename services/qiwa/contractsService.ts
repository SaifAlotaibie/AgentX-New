import { db, findByUser, findById, insert, update } from '@/lib/db/db'
import { EmploymentContract, CreateContractInput } from '@/lib/db/types'

export async function getContracts(user_id: string): Promise<EmploymentContract[]> {
  return await findByUser<EmploymentContract>('employment_contracts', user_id)
}

export async function getContractById(contract_id: string): Promise<EmploymentContract | null> {
  return await findById<EmploymentContract>('employment_contracts', contract_id)
}

export async function endContract(contract_id: string): Promise<EmploymentContract | null> {
  const contract = await findById<EmploymentContract>('employment_contracts', contract_id)
  
  if (!contract) {
    throw new Error('Contract not found')
  }

  if (contract.status === 'ended') {
    throw new Error('Contract already ended')
  }

  const updated = await update<EmploymentContract>(
    'employment_contracts',
    { id: contract_id },
    {
      status: 'ended',
      end_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  )

  return updated
}

export async function createContract(data: CreateContractInput & { end_date?: string, status?: string }): Promise<EmploymentContract | null> {
  console.log('🏗️ Creating contract with data:', data)
  
  const contractData = {
    ...data,
    status: data.status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  console.log('📦 Final contract data:', contractData)
  
  const result = await insert<EmploymentContract>('employment_contracts', contractData)
  
  if (!result) {
    throw new Error('Failed to create contract - insert returned null')
  }
  
  return result
}

export async function createMockContract(user_id: string): Promise<EmploymentContract | null> {
  const mockData: CreateContractInput = {
    user_id,
    employer_name: 'شركة التقنية المتقدمة',
    position: 'مهندس برمجيات',
    salary: 15000,
    start_date: new Date().toISOString(),
    contract_type: 'دوام كامل'
  }

  return await createContract(mockData)
}


