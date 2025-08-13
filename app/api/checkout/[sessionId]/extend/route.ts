import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'

// POST /api/checkout/[sessionId]/extend - Extend session expiry
export async function POST(
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

    // Check if session is still within reasonable extension time
    const now = new Date()
    const sessionCreated = new Date(session.created_at)
    const maxSessionAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

    if (now.getTime() - sessionCreated.getTime() > maxSessionAge) {
      return NextResponse.json(
        { error: 'Session too old to extend' },
        { status: 400 }
      )
    }

    // Extend session by 7 days
    const newExpiryDate = new Date()
    newExpiryDate.setDate(newExpiryDate.getDate() + 7)

    const { data: updatedSession, error: updateError } = await supabase
      .from('checkout_sessions')
      .update({
        expires_at: newExpiryDate.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', session.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to extend session:', updateError)
      return NextResponse.json(
        { error: 'Failed to extend session' },
        { status: 500 }
      )
    }

    // Log extension event
    const ip_address = request.headers.get('x-forwarded-for') || '0.0.0.0'
    const user_agent = request.headers.get('user-agent') || ''

    await supabase
      .from('checkout_session_events')
      .insert({
        session_id: session.id,
        event_type: 'session_extended',
        event_data: {
          previous_expiry: session.expires_at,
          new_expiry: updatedSession.expires_at,
          extended_by_days: 7,
        },
        step: session.current_step,
        user_agent,
        ip_address,
      })

    return NextResponse.json({
      success: true,
      expires_at: updatedSession.expires_at,
      message: 'Session extended successfully',
    })

  } catch (error) {
    console.error('Failed to extend session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}