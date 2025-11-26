
import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { ticketFollowUpTrigger } from '@/app/ai/proactive/rule_based_triggers'
import { getProactiveEventsForUser } from '@/app/ai/proactive'

export async function GET() {
    const logs: string[] = []
    const log = (msg: string, data?: any) => {
        console.log(msg, data || '')
        logs.push(msg + (data ? ' ' + JSON.stringify(data) : ''))
    }

    log('🔍 Starting Proactive System Verification...')

    try {
        // 1. Get a user with tickets
        log('1️⃣ Finding a user with open tickets...')
        const { data: tickets, error: ticketError } = await db
            .from('tickets')
            .select('*')
            .eq('status', 'open')
            .limit(1)

        if (ticketError || !tickets || tickets.length === 0) {
            log('❌ No open tickets found in DB to test with.')
            return NextResponse.json({ logs })
        }

        const testTicket = tickets[0]
        const userId = testTicket.user_id
        log(`✅ Found user ${userId} with open ticket #${testTicket.ticket_number}`)

        // 2. Check existing proactive events
        log('\n2️⃣ Checking existing proactive events for this user...')
        const { data: existingEvents } = await db
            .from('proactive_events')
            .select('*')
            .eq('user_id', userId)

        log(`   Found ${existingEvents?.length || 0} total events in DB`)
        existingEvents?.forEach(e => {
            log(`   - Event: ${e.event_type}, Acted: ${e.acted}, Created: ${e.detected_at}`)
        })

        // 3. Run the trigger manually
        log('\n3️⃣ Running ticketFollowUpTrigger manually...')
        const events = await ticketFollowUpTrigger.check()
        const userEvents = events.filter(e => e.user_id === userId)
        log(`✅ Trigger generated ${userEvents.length} events for this user`)

        // 4. Check DB again to see if new events were persisted
        log('\n4️⃣ Checking DB for NEW persisted events...')
        const { data: newEvents } = await db
            .from('proactive_events')
            .select('*')
            .eq('user_id', userId)
            .order('detected_at', { ascending: false })
            .limit(5)

        log(`   Latest events in DB:`)
        newEvents?.forEach(e => {
            log(`   - ID: ${e.id}`)
            log(`     Type: ${e.event_type}`)
            log(`     Acted: ${e.acted} (Should be false!)`)
            log(`     Action Taken: ${e.action_taken} (Should be null/empty)`)
        })

        // 5. Verify retrieval function
        log('\n5️⃣ Verifying getProactiveEventsForUser()...')
        const retrievedEvents = await getProactiveEventsForUser(userId)
        log(`✅ Retrieved ${retrievedEvents.length} pending events for display`)

        if (retrievedEvents.length > 0) {
            log('   Events ready for AI context:')
            retrievedEvents.forEach(e => log(`   - ${e.event_type}: ${e.suggested_action}`))
        } else {
            log('⚠️ No events retrieved! Something is still wrong.')
        }

        return NextResponse.json({ success: true, logs })
    } catch (error: any) {
        log('❌ Exception:', error.message)
        return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 })
    }
}
