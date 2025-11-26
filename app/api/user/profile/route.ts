import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const user_id = searchParams.get('user_id')

        if (!user_id) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        // Fetch user profile - only select columns that actually exist in schema
        const { data, error } = await db
            .from('user_profile')
            .select('full_name, national_id, phone, nationality')
            .eq('user_id', user_id)
            .maybeSingle()

        if (error) {
            console.error('Error fetching user profile:', error)
            return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
        }

        // Return empty object if no profile found
        return NextResponse.json(data || { full_name: null })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
