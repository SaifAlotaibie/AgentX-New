
import { db } from '../app/lib/db/db'
import { ticketFollowUpTrigger } from '../app/ai/proactive/rule_based_triggers'
import { getProactiveEventsForUser } from '../app/ai/proactive'

async function verifyProactiveSystem() {
    console.log('🔍 Starting Proactive System Verification...\n')

    // 1. Get a user with tickets
    console.log('1️⃣ Finding a user with open tickets...')
    const { data: tickets, error: ticketError } = await db
        .from('tickets')
        .select('*')
        .eq('status', 'open')
        .limit(1)

    if (ticketError || !tickets || tickets.length === 0) {
        console.error('❌ No open tickets found in DB to test with.')
        return
    }

    const testTicket = tickets[0]
    const userId = testTicket.user_id
    console.log(`✅ Found user ${userId} with open ticket #${testTicket.ticket_number}`)
    console.log(`   Ticket created at: ${testTicket.created_at}`)

    // 2. Check existing proactive events
    console.log('\n2️⃣ Checking existing proactive events for this user...')
    const { data: existingEvents } = await db
        .from('proactive_events')
        .select('*')
        .eq('user_id', userId)

    console.log(`   Found ${existingEvents?.length || 0} total events in DB`)
    existingEvents?.forEach(e => {
        console.log(`   - Event: ${e.event_type}, Acted: ${e.acted}, Created: ${e.detected_at}`)
    })

    // 3. Run the trigger manually
    console.log('\n3️⃣ Running ticketFollowUpTrigger manually...')
    try {
        const events = await ticketFollowUpTrigger.check()
        const userEvents = events.filter(e => e.user_id === userId)
        console.log(`✅ Trigger generated ${userEvents.length} events for this user`)
        console.log('   (Note: The trigger function itself should have saved them to DB now)')
    } catch (err) {
        console.error('❌ Error running trigger:', err)
    }

    // 4. Check DB again to see if new events were persisted
    console.log('\n4️⃣ Checking DB for NEW persisted events...')
    const { data: newEvents } = await db
        .from('proactive_events')
        .select('*')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(5)

    console.log(`   Latest events in DB:`)
    newEvents?.forEach(e => {
        console.log(`   - ID: ${e.id}`)
        console.log(`     Type: ${e.event_type}`)
        console.log(`     Acted: ${e.acted} (Should be false!)`)
        console.log(`     Action Taken: ${e.action_taken} (Should be null/empty)`)
        console.log(`     Metadata:`, e.metadata)
        console.log('     ---')
    })

    // 5. Verify retrieval function
    console.log('\n5️⃣ Verifying getProactiveEventsForUser()...')
    const retrievedEvents = await getProactiveEventsForUser(userId)
    console.log(`✅ Retrieved ${retrievedEvents.length} pending events for display`)

    if (retrievedEvents.length > 0) {
        console.log('   Events ready for AI context:')
        retrievedEvents.forEach(e => console.log(`   - ${e.event_type}: ${e.suggested_action}`))
    } else {
        console.warn('⚠️ No events retrieved! Something is still wrong.')
    }
}

verifyProactiveSystem()
