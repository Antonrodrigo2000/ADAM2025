import { createServiceRoleClient } from '@/lib/supabase/server'

export interface SignupRequest {
  // User details
  email: string
  password: string
  legalFirstName: string
  legalSurname: string
  dateOfBirth: string
  phoneNumber: string
  sex: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  
  // Address
  address: string
  city: string
  postcode: string
  
  // Agreements
  agreeToTerms: boolean
  marketingOptOut?: boolean
  
  // Optional NIC for eMed
  nic?: string
}

export function validateSignupRequest(body: SignupRequest) {
  if (!body.email || !body.password || !body.legalFirstName || !body.legalSurname) {
    return { isValid: false, error: 'Missing required fields' }
  }

  return { isValid: true }
}

export async function checkNicExists(nic: string): Promise<{ exists: boolean; error?: string }> {
  try {
    const adminClient = createServiceRoleClient()
    
    const { data, error } = await adminClient
      .from('user_profiles')
      .select('id')
      .eq('nic', nic)
      .limit(1)

    if (error) {
      console.error('Error checking NIC:', error)
      return { exists: false, error: 'Failed to validate NIC' }
    }

    return { exists: data && data.length > 0 }
  } catch (error) {
    console.error('NIC validation error:', error)
    return { exists: false, error: 'Failed to validate NIC' }
  }
}