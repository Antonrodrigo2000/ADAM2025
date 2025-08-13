import { createClient } from '@/lib/supabase/server'
import { createServerProfile } from '@/contexts/auth-server'
import type { SignupRequest } from './validation'

export interface UserCreationResult {
  success: boolean
  userId?: string
  error?: string
}

export async function createUserAccount(body: SignupRequest): Promise<UserCreationResult> {
  try {
    console.log('Creating user account for:', body.email)
    
    const supabase = await createClient()
    
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          first_name: body.legalFirstName,
          last_name: body.legalSurname,
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return {
        success: false,
        error: `Failed to create account: ${authError.message}`
      }
    }

    if (!authData.user) {
      console.error('No user returned from signup')
      return {
        success: false,
        error: 'Failed to create user account'
      }
    }

    console.log('User created successfully:', authData.user.id)

    // Step 2: Create user profile
    console.log('Creating user profile...')
    
    const profileData = {
      first_name: body.legalFirstName,
      last_name: body.legalSurname,
      date_of_birth: body.dateOfBirth,
      phone: body.phoneNumber,
      nic: body.nic, // Store the NIC
      address: {
        street: body.address,
        city: body.city,
        postcode: body.postcode,
        country: 'Sri Lanka'
      },
      sex: body.sex,
      agreed_to_terms: body.agreeToTerms,
      agreed_to_terms_at: body.agreeToTerms ? new Date().toISOString() : null,
      agreed_to_marketing: body.marketingOptOut || false,
      agreed_to_marketing_at: body.marketingOptOut ? new Date().toISOString() : null,
      marketing_preferences: {
        email: !body.marketingOptOut,
        sms: !body.marketingOptOut,
        newsletter: !body.marketingOptOut,
        productUpdates: !body.marketingOptOut
      },
      account_status: 'active',
      email_verified: false,
      phone_verified: false,
      verification_status: 'pending'
    }

    const profile = await createServerProfile(authData.user.id, profileData)
    if (!profile) {
      console.error('Failed to create user profile')
      return {
        success: false,
        error: 'Failed to create user profile'
      }
    }
    
    console.log('User profile created successfully')

    return {
      success: true,
      userId: authData.user.id
    }
  } catch (error) {
    console.error('User creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    }
  }
}