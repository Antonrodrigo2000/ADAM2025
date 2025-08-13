import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'

// POST /api/checkout/[sessionId]/complete - Complete checkout session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { payment_intent_id, order_id } = body

    const supabase = await createClient()
    const user = await getServerUser()

    // Get current session
    const { data: session, error: fetchError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionId)
      .eq('status', 'active')
      .single()

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
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

    // Validate session is ready for completion
    if (session.current_step !== 'processing') {
      return NextResponse.json(
        { error: 'Session not ready for completion' },
        { status: 400 }
      )
    }

    // Mark session as completed
    const completedAt = new Date().toISOString()
    const { data: completedSession, error: updateError } = await supabase
      .from('checkout_sessions')
      .update({
        status: 'completed',
        current_step: 'complete',
        completed_at: completedAt,
        payment_intent_id,
        updated_at: completedAt,
      })
      .eq('id', session.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to complete session:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      )
    }

    // Log completion event
    const ip_address = request.headers.get('x-forwarded-for') || '0.0.0.0'
    const user_agent = request.headers.get('user-agent') || ''

    await supabase
      .from('checkout_session_events')
      .insert({
        session_id: session.id,
        event_type: 'session_completed',
        event_data: {
          payment_intent_id,
          order_id,
          cart_total: session.cart_total,
          cart_items_count: Array.isArray(session.cart_items) ? session.cart_items.length : 0,
          completion_time_minutes: Math.round(
            (new Date(completedAt).getTime() - new Date(session.created_at).getTime()) / 60000
          ),
        },
        step: 'complete',
        user_agent,
        ip_address,
      })

    return NextResponse.json({
      success: true,
      session: completedSession,
      redirect_url: `/checkout/${sessionId}/complete`,
    })

  } catch (error) {
    console.error('Failed to complete session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}