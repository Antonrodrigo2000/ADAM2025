import { createServiceRoleClient } from '@/lib/supabase/server'

export interface EventLoggingResult {
  success: boolean
  error?: string
}

export async function logCheckoutEvent(
  sessionId: string,
  eventType: string,
  eventData: any
): Promise<EventLoggingResult> {
  try {
    console.log('Logging checkout event:', eventType)
    
    const adminClient = createServiceRoleClient()
    
    const { error: logError } = await adminClient
      .from('checkout_session_events')
      .insert({
        session_token: sessionId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString()
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