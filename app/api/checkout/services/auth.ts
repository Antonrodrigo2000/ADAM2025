import { createClient } from '@/lib/supabase/server'
import { getServerAuth, createServerProfile } from '@/contexts/auth-server'
import type { CheckoutRequest } from './validation'

export interface UserAuthResult {
  userId: string
  isNewUser: boolean
  error?: string
}

export async function handleUserAuth(body: CheckoutRequest, signal?: AbortSignal): Promise<UserAuthResult> {
  if (signal?.aborted) {
    throw new Error('Operation cancelled')
  }

  const { user: existingUser, isAuthenticated } = await getServerAuth()
  
  if (isAuthenticated && existingUser) {
    return {
      userId: existingUser.id,
      isNewUser: false
    }
  }

  // Create new user account
  const supabase = await createClient()
  
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
      userId: '',
      isNewUser: false,
      error: `Failed to create account: ${authError.message}`
    }
  }

  if (!authData.user) {
    return {
      userId: '',
      isNewUser: false,
      error: 'Failed to create user account'
    }
  }

  // Create user profile
  const profileData = {
    first_name: body.legalFirstName,
    last_name: body.legalSurname,
    date_of_birth: body.dateOfBirth,
    phone: body.phoneNumber,
    address: {
      street: body.address,
      city: body.city,
      postcode: body.postcode,
      country: 'Sri Lanka'
    },
    sex: body.sex,
    agreed_to_terms: body.agreeToTerms,
    agreed_to_terms_at: body.agreeToTerms ? new Date().toISOString() : null,
    agreed_to_marketing: body.marketingOptOut,
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
  }

  return {
    userId: authData.user.id,
    isNewUser: true
  }
}