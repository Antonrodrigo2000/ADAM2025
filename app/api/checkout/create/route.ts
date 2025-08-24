import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerUser } from '@/contexts/auth-server'

interface CreateSessionRequest {
  cart_items: Array<{
    product_id: string
    quantity: number
    price: number
    productName?: string
    variantName?: string
    image?: string
    monthlyPrice?: number
    months?: number
    prescriptionRequired?: boolean
    consultationFee?: number
  }>
  source?: string
  marketing_source?: string
  campaign_id?: string
}

export async function POST(request: NextRequest) {
  try {
    let body: CreateSessionRequest
    
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { cart_items, source = 'web', marketing_source, campaign_id } = body

    // Validate cart items
    if (!cart_items || cart_items.length === 0) {
      return NextResponse.json(
        { error: 'Cart cannot be empty' },
        { status: 400 }
      )
    }

    // Calculate cart total
    const cart_total = cart_items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )

    // Get user if authenticated
    const user = await getServerUser()
    
    // Get client IP and user agent
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '0.0.0.0'
    const user_agent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer')

    const supabase = await createClient()

    // Create checkout session
    const { data: session, error } = await supabase
      .from('checkout_sessions')
      .insert({
        user_id: user?.id || null,
        cart_items,
        cart_total,
        source,
        marketing_source,
        campaign_id,
        ip_address,
        user_agent,
        referrer,
        current_step: user ? 'payment' : 'information', // Skip info for authenticated users
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create checkout session:', error)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    // Log session creation event
    await supabase
      .from('checkout_session_events')
      .insert({
        session_id: session.id,
        event_type: 'session_created',
        event_data: {
          cart_items_count: cart_items.length,
          cart_total,
          user_authenticated: !!user,
        },
        step: session.current_step,
        user_agent,
        ip_address,
      })

    // Return session token and redirect URL
    const redirectStep = user ? 'payment' : 'information'
    
    return NextResponse.json({
      success: true,
      session_token: session.session_token,
      redirect_url: `/checkout/${session.session_token}/${redirectStep}`,
      expires_at: session.expires_at,
    })

  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}