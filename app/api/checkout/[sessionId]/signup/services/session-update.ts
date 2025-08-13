import { createServiceRoleClient } from '@/lib/supabase/server'

export interface SessionUpdateResult {
  success: boolean
  error?: string
}

export async function updateCheckoutSession(
  sessionId: string, 
  userId: string,
  customerInfo: any,
  shippingAddress?: any
): Promise<SessionUpdateResult> {
  try {
    console.log('Updating checkout session:', sessionId)
    
    const adminClient = createServiceRoleClient()
    
    // Update session with user information
    const updateData: any = {
      user_id: userId,
      customer_info: customerInfo,
      current_step: 'payment',
      updated_at: new Date().toISOString()
    }

    if (shippingAddress) {
      updateData.shipping_address = shippingAddress
    }

    const { error: updateError } = await adminClient
      .from('checkout_sessions')
      .update(updateData)
      .eq('session_token', sessionId)

    if (updateError) {
      console.error('Failed to update checkout session:', updateError)
      return {
        success: false,
        error: 'Failed to update checkout session'
      }
    }

    console.log('Checkout session updated successfully')
    
    return { success: true }
  } catch (error) {
    console.error('Session update error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Session update failed'
    }
  }
}