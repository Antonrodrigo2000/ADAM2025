import { createServiceRoleClient } from '@/lib/supabase/server'

export interface EventLoggingResult {
  success: boolean
  error?: string
}

export async function logCheckoutEvent(
  sessionToken: string,
  eventType: string,
  eventData: any
): Promise<EventLoggingResult> {
  try {
    console.log('Logging checkout event:', eventType)
    
    const adminClient = createServiceRoleClient()
    
    // First, get the session ID from the session token
    const { data: session, error: sessionError } = await adminClient
      .from('checkout_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .single()

    if (sessionError || !session) {
      console.error('Failed to find checkout session:', sessionError)
      return {
        success: false,
        error: 'Session not found'
      }
    }
    
    const { error: logError } = await adminClient
      .from('checkout_session_events')
      .insert({
        session_id: session.id,
        event_type: eventType,
        event_data: eventData
      })

    if (logError) {
      console.error('Failed to log checkout event:', logError)
      return {
        success: false,
        error: 'Failed to log checkout event'
      }
    }

    console.log('Checkout event logged successfully')
    
    return { success: true }
  } catch (error) {
    console.error('Event logging error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Event logging failed'
    }
  }
}