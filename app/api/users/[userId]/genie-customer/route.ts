import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  try {
    const { userId } = params

    // Get authenticated user
    const cookieStore = cookies()
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user can only get their own Genie customer ID
    if (userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot access another user\'s Genie customer data' },
        { status: 403 }
      )
    }

    // Get user's Genie customer ID from user_profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('genie_customer_id')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('❌ Error getting user profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'Failed to get user profile' },
        { status: 500 }
      )
    }

    if (!userProfile || !userProfile.genie_customer_id) {
      return NextResponse.json(
        { success: false, error: 'User does not have a Genie customer ID' },
        { status: 404 }
      )
    }

    console.log('✅ Retrieved Genie customer ID for user:', userId)

    return NextResponse.json({
      success: true,
      genieCustomerId: userProfile.genie_customer_id
    })

  } catch (error) {
    console.error('❌ Get Genie customer API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}