import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle checkout session routes first
  const checkoutSessionMatch = pathname.match(/^\/checkout\/([^\/]+)\/(.+)$/)
  
  if (checkoutSessionMatch) {
    const checkoutResponse = await handleCheckoutSession(request, checkoutSessionMatch)
    if (checkoutResponse) return checkoutResponse
  }

  // Handle checkout root redirect
  if (pathname === '/checkout' || pathname === '/checkout/') {
    return handleCheckoutRoot(request)
  }

  // Continue with standard Supabase session management
  return await updateSession(request)
}

async function handleCheckoutSession(
  request: NextRequest, 
  match: RegExpMatchArray
) {
  const [, sessionToken, requestedStep] = match
  
  try {
    // Validate session token format
    if (!sessionToken.match(/^cs_[a-f0-9]{30}$/)) {
      return redirectToNewCheckout(request, 'Invalid session format')
    }

    const supabase = await createClient()
    
    // Get session from database
    const { data: session, error } = await supabase
      .from('checkout_sessions')
      .select(`
        id,
        session_token,
        user_id,
        status,
        current_step,
        expires_at,
        cart_items,
        cart_total
      `)
      .eq('session_token', sessionToken)
      .single()

    // Handle session not found or database error
    if (error || !session) {
      console.warn('Session not found:', sessionToken, error?.message)
      return redirectToNewCheckout(request, 'Session not found')
    }

    // Check if session is expired
    if (new Date() > new Date(session.expires_at)) {
      console.warn('Session expired:', sessionToken)
      
      // Mark session as expired
      await supabase
        .from('checkout_sessions')
        .update({ status: 'expired' })
        .eq('id', session.id)
      
      return redirectToNewCheckout(request, 'Session expired')
    }

    // Check if session is not active
    if (session.status !== 'active') {
      console.warn('Session not active:', sessionToken, session.status)
      return redirectToNewCheckout(request, 'Session no longer active')
    }

    // Validate step progression and redirect if needed
    const redirectResponse = await validateStepProgression(
      request, 
      session, 
      requestedStep,
      supabase
    )
    
    if (redirectResponse) {
      return redirectResponse
    }

    // Session is valid - extend expiry for active users
    if (shouldExtendSession(session)) {
      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 7)
      
      await supabase
        .from('checkout_sessions')
        .update({ 
          expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id)
    }

    // Log page view
    await logSessionEvent(supabase, session.id, 'page_view', {
      step: requestedStep,
      referrer: request.headers.get('referer'),
    }, request)

    return null // Continue to standard middleware

  } catch (error) {
    console.error('Checkout middleware error:', error)
    return redirectToNewCheckout(request, 'Session validation failed')
  }
}

async function validateStepProgression(
  request: NextRequest,
  session: any,
  requestedStep: string,
  supabase: any
): Promise<NextResponse | null> {
  const { current_step, user_id, session_token } = session
  const validSteps = ['information', 'payment', 'processing', 'complete']
  
  // Check if requested step is valid
  if (!validSteps.includes(requestedStep)) {
    return redirectToStep(request, session_token, current_step || 'information')
  }

  const currentStepIndex = validSteps.indexOf(current_step)
  const requestedStepIndex = validSteps.indexOf(requestedStep)

  // Handle authenticated users - skip information step
  if (user_id && requestedStep === 'information') {
    // Update session to payment step if still on information
    if (current_step === 'information') {
      await supabase
        .from('checkout_sessions')
        .update({ 
          current_step: 'payment',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id)
    }
    return redirectToStep(request, session_token, 'payment')
  }

  // Prevent skipping ahead more than one step
  if (requestedStepIndex > currentStepIndex + 1) {
    const allowedStep = validSteps[currentStepIndex] || 'information'
    return redirectToStep(request, session_token, allowedStep)
  }

  // Handle completed sessions
  if (session.status === 'completed' && requestedStep !== 'complete') {
    return redirectToStep(request, session_token, 'complete')
  }

  return null // No redirect needed
}

function redirectToStep(request: NextRequest, sessionToken: string, step: string) {
  const url = new URL(`/checkout/${sessionToken}/${step}`, request.url)
  return NextResponse.redirect(url)
}

async function handleCheckoutRoot(request: NextRequest) {
  // Redirect to cart or checkout creation
  const url = new URL('/cart', request.url)
  return NextResponse.redirect(url)
}

function redirectToNewCheckout(request: NextRequest, reason: string) {
  const url = new URL('/cart', request.url)
  url.searchParams.set('checkout_error', reason)
  return NextResponse.redirect(url)
}

function shouldExtendSession(session: any): boolean {
  const now = new Date()
  const expiresAt = new Date(session.expires_at)
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  
  // Extend if session expires within 24 hours
  return timeUntilExpiry < oneDayMs
}

async function logSessionEvent(
  supabase: any,
  sessionId: string,
  eventType: string,
  eventData: any,
  request: NextRequest
) {
  try {
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '0.0.0.0'
    const user_agent = request.headers.get('user-agent') || ''

    await supabase
      .from('checkout_session_events')
      .insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData,
        step: eventData.step,
        user_agent,
        ip_address,
      })
  } catch (error) {
    console.warn('Failed to log session event:', error)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}