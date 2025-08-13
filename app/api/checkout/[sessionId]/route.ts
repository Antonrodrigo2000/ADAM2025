import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'

// GET /api/checkout/[sessionId] - Retrieve session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const supabase = await createClient()
    const user = await getServerUser()

    // Get session with security check
    const { data: session, error } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    // Security: Ensure user can access this session
    if (session.user_id && (!user || session.user_id !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      session,
    })

  } catch (error) {
    console.error('Failed to retrieve session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/checkout/[sessionId] - Update session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const updates = await request.json()
    const supabase = await createClient()
    const user = await getServerUser()

    // Get current session first
    const { data: currentSession, error: fetchError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionId)
      .eq('status', 'active')
      .single()

    if (fetchError || !currentSession) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    // Security: Ensure user can update this session
    if (currentSession.user_id && (!user || currentSession.user_id !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate and sanitize updates
    const allowedUpdates = [
      'current_step',
      'customer_info',
      'shipping_address',
      'billing_address',
      'selected_payment_method_id',
      'payment_intent_id',
    ]

    const sanitizedUpdates: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        sanitizedUpdates[key] = value
      }
    }

    // Always update the timestamp
    sanitizedUpdates.updated_at = new Date().toISOString()

    // Handle step progression
    if (sanitizedUpdates.current_step) {
      const validSteps = ['information', 'payment', 'processing', 'complete']
      if (!validSteps.includes(sanitizedUpdates.current_step)) {
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        )
      }
    }

    // Handle user association (when user signs up during checkout)
    if (user && !currentSession.user_id) {
      sanitizedUpdates.user_id = user.id
    }

    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('checkout_sessions')
      .update(sanitizedUpdates)
      .eq('id', currentSession.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update session:', updateError)
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    // Log update event if step changed
    if (sanitizedUpdates.current_step && sanitizedUpdates.current_step !== currentSession.current_step) {
      const ip_address = request.headers.get('x-forwarded-for') || '0.0.0.0'
      const user_agent = request.headers.get('user-agent') || ''

      await supabase
        .from('checkout_session_events')
        .insert({
          session_id: updatedSession.id,
          event_type: 'step_progressed',
          event_data: {
            from_step: currentSession.current_step,
            to_step: sanitizedUpdates.current_step,
            user_updates: Object.keys(sanitizedUpdates).filter(k => k !== 'current_step' && k !== 'updated_at'),
          },
          step: sanitizedUpdates.current_step,
          user_agent,
          ip_address,
        })
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    })

  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/checkout/[sessionId] - Cancel/expire session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const supabase = await createClient()
    const user = await getServerUser()

    // Get current session
    const { data: session, error: fetchError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionId)
      .single()

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Security check
    if (session.user_id && (!user || session.user_id !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Mark as cancelled instead of hard delete (for analytics)
    const { error: updateError } = await supabase
      .from('checkout_sessions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    if (updateError) {
      console.error('Failed to cancel session:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel session' },
        { status: 500 }
      )
    }

    // Log cancellation event
    const ip_address = request.headers.get('x-forwarded-for') || '0.0.0.0'
    const user_agent = request.headers.get('user-agent') || ''

    await supabase
      .from('checkout_session_events')
      .insert({
        session_id: session.id,
        event_type: 'session_cancelled',
        event_data: {
          cancelled_at_step: session.current_step,
          reason: 'user_cancelled',
        },
        step: session.current_step,
        user_agent,
        ip_address,
      })

    return NextResponse.json({
      success: true,
      message: 'Session cancelled',
    })

  } catch (error) {
    console.error('Failed to cancel session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}