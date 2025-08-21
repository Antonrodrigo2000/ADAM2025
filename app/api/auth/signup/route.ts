import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateSignupRequest, checkNicExists, type SignupRequest } from '../../checkout/[sessionId]/signup/services/validation'
import { createUserAccount } from '../../checkout/[sessionId]/signup/services/user-creation'
import { handleEmedIntegration } from '../../checkout/[sessionId]/signup/services/emed-integration'
import { createGenieCustomer, buildGenieCustomerData } from '../../checkout/[sessionId]/signup/services/genie-customer-creation'

// POST /api/auth/signup - Create new user account (standalone, not session-based)
export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()

    // Validate request data
    const validation = validateSignupRequest(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check for duplicate NIC if provided
    if (body.nic) {
      const nicCheck = await checkNicExists(body.nic)
      if (nicCheck.error) {
        return NextResponse.json(
          { error: nicCheck.error },
          { status: 500 }
        )
      }
      if (nicCheck.exists) {
        return NextResponse.json(
          { error: 'NIC already in use' },
          { status: 400 }
        )
      }
    }

    // Step 1: Create user account and profile
    const userResult = await createUserAccount(body)
    if (!userResult.success || !userResult.userId) {
      return NextResponse.json(
        { error: userResult.error || 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Step 2: Create Genie customer
    const genieCustomerData = buildGenieCustomerData(body, userResult.userId)
    const genieResult = await createGenieCustomer(genieCustomerData)
    // Continue even if Genie customer creation fails - don't break the signup flow

    // Step 3: eMed Integration - Create patient and get patient ID
    const emedResult = await handleEmedIntegration(userResult.userId, body)

    // Step 4: Log the signup event (optional for standalone signup)
    const supabase = await createClient()
    try {
      await supabase.from('user_events').insert({
        user_id: userResult.userId,
        event_type: 'standalone_signup_completed',
        event_data: {
          emed_patient_id: emedResult.patientId,
          emed_integration_success: emedResult.success,
          genie_customer_id: genieResult.customerId,
          genie_integration_success: genieResult.success,
          is_new_user: true,
          ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
          user_agent: request.headers.get('user-agent') || ''
        }
      })
    } catch (eventError) {
      console.error('Failed to log signup event:', eventError)
      // Continue - don't fail signup if event logging fails
    }

    return NextResponse.json({
      success: true,
      userId: userResult.userId,
      isNewUser: true,
      emedPatientId: emedResult.patientId,
      genieCustomerId: genieResult.customerId,
      message: 'Account created successfully. Welcome to Adam!',
    })

  } catch (error) {
    console.error('Standalone signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}