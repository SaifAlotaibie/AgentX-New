import { db, findByUser, insert } from '@/lib/db/db'
import { Certificate, UserProfile, EmploymentContract } from '@/lib/db/types'

async function getUserProfile(user_id: string): Promise<UserProfile | null> {
  const { data, error } = await db
    .from('user_profile')
    .select('*')
    .eq('user_id', user_id)
    .single()

  if (error) return null
  return data as UserProfile
}

async function getActiveContract(user_id: string): Promise<EmploymentContract | null> {
  const { data, error } = await db
    .from('employment_contracts')
    .select('*')
    .eq('user_id', user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data as EmploymentContract
}

export async function getCertificates(user_id: string): Promise<Certificate[]> {
  return await findByUser<Certificate>('certificates', user_id)
}

export async function generateSalaryDefinition(user_id: string): Promise<Certificate | null> {
  const profile = await getUserProfile(user_id)
  const contract = await getActiveContract(user_id)

  if (!profile || !contract) {
    throw new Error('User profile or active contract not found')
  }

  const content = `
تعريف براتب

بسم الله الرحمن الرحيم

إلى من يهمه الأمر

السلام عليكم ورحمة الله وبركاته،

نفيد بأن السيد/ة: ${profile.full_name}
يعمل/تعمل لدى: ${contract.employer_name}
في وظيفة: ${contract.position}
براتب شهري قدره: ${contract.salary.toLocaleString('ar-SA')} ريال سعودي

تاريخ بدء العمل: ${new Date(contract.start_date).toLocaleDateString('ar-SA')}
نوع العقد: ${contract.contract_type}

وقد أعطي هذا التعريف بناءً على طلبه/ا دون أدنى مسؤولية علينا.

والله الموفق،

تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}
  `.trim()

  const certificateData = {
    user_id,
    certificate_type: 'salary_definition',
    content,
    issue_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  }

  return await insert<Certificate>('certificates', certificateData)
}

export async function generateServiceCertificate(user_id: string): Promise<Certificate | null> {
  const profile = await getUserProfile(user_id)
  const contract = await getActiveContract(user_id)

  if (!profile || !contract) {
    throw new Error('User profile or active contract not found')
  }

  const startDate = new Date(contract.start_date)
  const now = new Date()
  const years = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor(((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) % 12)

  const content = `
شهادة خبرة

بسم الله الرحمن الرحيم

إلى من يهمه الأمر

السلام عليكم ورحمة الله وبركاته،

نشهد بأن السيد/ة: ${profile.full_name}
عمل/ت لدينا في: ${contract.employer_name}
في وظيفة: ${contract.position}

فترة العمل: من ${startDate.toLocaleDateString('ar-SA')} إلى ${now.toLocaleDateString('ar-SA')}
إجمالي مدة الخدمة: ${years} سنة و ${months} شهر

وقد أظهر/ت خلال فترة عمله/ا الكفاءة والالتزام والجدية في العمل.

نتمنى له/ا التوفيق في مسيرته/ا المهنية.

والله الموفق،

تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}
  `.trim()

  const certificateData = {
    user_id,
    certificate_type: 'service_certificate',
    content,
    issue_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  }

  return await insert<Certificate>('certificates', certificateData)
}

export async function generateLaborLicense(user_id: string): Promise<Certificate | null> {
  const profile = await getUserProfile(user_id)
  const contract = await getActiveContract(user_id)

  if (!profile || !contract) {
    throw new Error('User profile or active contract not found')
  }

  const licenseNumber = `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  const content = `
رخصة عمل

وزارة الموارد البشرية والتنمية الاجتماعية
المملكة العربية السعودية

رقم الرخصة: ${licenseNumber}

الاسم: ${profile.full_name}
المنشأة: ${contract.employer_name}
المهنة: ${contract.position}

تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}
تاريخ الانتهاء: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')}

هذه الرخصة صالحة لمدة سنة واحدة من تاريخ الإصدار.

مع تحيات وزارة الموارد البشرية والتنمية الاجتماعية
  `.trim()

  const certificateData = {
    user_id,
    certificate_type: 'labor_license',
    content,
    issue_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  }

  return await insert<Certificate>('certificates', certificateData)
}


