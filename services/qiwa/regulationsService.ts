import { findAll } from '@/lib/db/db'
import { WorkRegulation } from '@/lib/db/types'

export async function getRegulations(): Promise<WorkRegulation[]> {
  return await findAll<WorkRegulation>('work_regulations')
}

export async function getRegulationsByCategory(category: string): Promise<WorkRegulation[]> {
  const allRegulations = await getRegulations()
  return allRegulations.filter(reg => reg.category === category)
}

export async function searchRegulations(query: string): Promise<WorkRegulation[]> {
  const allRegulations = await getRegulations()
  const lowerQuery = query.toLowerCase()
  
  return allRegulations.filter(reg => 
    reg.title.toLowerCase().includes(lowerQuery) ||
    reg.description.toLowerCase().includes(lowerQuery) ||
    reg.content.toLowerCase().includes(lowerQuery)
  )
}


