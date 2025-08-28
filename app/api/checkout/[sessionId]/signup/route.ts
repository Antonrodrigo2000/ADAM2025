import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateSignupRequest, checkNicExists, type SignupRequest } from './services/validation'
import { createUserAccount } from './services/user-creation'
import { handleEmedIntegration } from './services/emed-integration'
import { updateCheckoutSession } from './services/session-update'
import { logCheckoutEvent } from './services/event-logging'
import { saveQuestionnaireResponses } from './services/questionnaire-saving'
import { createGenieCustomer, buildGenieCustomerData } from './services/genie-customer-creation'
import { ApplicationImageMigration, type ApplicationMigrationResult } from '@/lib/services/application-image-migration'

// POST /api/checkout/[sessionId]/signup - Create new user and integrate with eMed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body: SignupRequest = await request.json()

    const supabase = await createClient()

    // Validate that session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    // Check if session already has a user
    if (session.user_id) {
      return NextResponse.json(
        { error: 'Session already has a user associated' },
        { status: 400 }
      )
    }

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

    // Step 3: Save questionnaire responses from localStorage if available
    const questionnaireResult = await saveQuestionnaireResponses(userResult.userId, body)
    // Continue even if questionnaire saving fails - don't break the signup flow

    // Step 4: Migrate anonymous images to user folder if any exist (AFTER questionnaire responses are saved)
    let imageMigrationResult: ApplicationMigrationResult = { success: true, storageFilesMigrated: 0, storageFailures: 0, databasePathsUpdated: 0 }
    if (body.questionnaireData?.sessionId) {
      try {
        console.log(`🔄 Migrating images for user ${userResult.userId} from session ${body.questionnaireData.sessionId}`)
        imageMigrationResult = await ApplicationImageMigration.migrateAnonymousImages(
          userResult.userId,
          body.questionnaireData.sessionId
        )
        if (imageMigrationResult.success) {
          console.log(`✅ Image migration successful: ${imageMigrationResult.storageFilesMigrated} files migrated, ${imageMigrationResult.databasePathsUpdated} database paths updated`)
        } else {
          console.warn(`⚠️ Image migration failed: ${imageMigrationResult.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('❌ Image migration failed:', error)
        // Continue with signup even if migration fails
      }
    }

    // Step 5: eMed Integration - Create patient and get patient ID
    const emedResult = await handleEmedIntegration(userResult.userId, body)

    // Step 6: Update checkout session with user information
    const customerInfo = {
      first_name: body.legalFirstName,
      last_name: body.legalSurname,
      email: body.email,
      phone: body.phoneNumber,
    }
    
    const shippingAddress = {
      street: body.address,
      city: body.city,
      postcode: body.postcode,
      country: 'Sri Lanka'
    }
    
    const sessionUpdateResult = await updateCheckoutSession(sessionId, userResult.userId, customerInfo, shippingAddress)
    if (!sessionUpdateResult.success) {
      return NextResponse.json(
        { error: sessionUpdateResult.error || 'Failed to update session after signup' },
        { status: 500 }
      )
    }

    // Step 7: Log signup event
    const eventData = {
      user_id: userResult.userId,
      emed_patient_id: emedResult.patientId,
      emed_integration_success: emedResult.success,
      genie_customer_id: genieResult.customerId,
      genie_integration_success: genieResult.success,
      questionnaire_saved: questionnaireResult.success,
      questionnaire_health_vertical: body.questionnaireData?.healthVertical,
      images_migrated: imageMigrationResult.storageFilesMigrated,
      images_migration_success: imageMigrationResult.success,
      responses_updated: imageMigrationResult.databasePathsUpdated,
      is_new_user: true,
      ip_address: request.headers.get('x-forwarded-for') || '0.0.0.0',
      user_agent: request.headers.get('user-agent') || ''
    }
    
    await logCheckoutEvent(sessionId, 'user_signup_completed', eventData)
    // Continue even if event logging fails

    return NextResponse.json({
      success: true,
      userId: userResult.userId,
      isNewUser: true,
      emedPatientId: emedResult.patientId,
      genieCustomerId: genieResult.customerId,
      nextStep: 'payment',
      message: 'Account created successfully. Please complete your payment details.',
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}