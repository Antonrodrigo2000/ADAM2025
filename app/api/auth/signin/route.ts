import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SigninRequest {
  email: string
  password: string
}

// POST /api/auth/signin - Sign in user
export async function POST(request: NextRequest) {
  try {
    const { email, password }: SigninRequest = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Attempt to sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Handle specific auth errors
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please verify your email address before signing in' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Sign in failed' },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Sign in failed' },
        { status: 401 }
      )
    }

    // Get user profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // Log the signin event
    try {
      await supabase.from('user_events').insert({
        user_id: data.user.id,
        event_type: 'user_signin',
        event_data: {
          ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
          user_agent: request.headers.get('user-agent') || ''
        }
      })
    } catch (eventError) {
      console.error('Failed to log signin event:', eventError)
      // Continue - don't fail signin if event logging fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile || null
      },
      session: data.session,
      message: 'Signed in successfully',
    })

  } catch (error) {
    console.error('Signin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}