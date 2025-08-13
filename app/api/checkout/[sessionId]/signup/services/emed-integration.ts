import { createOrGetEmedPatient, updateUserEmedPatientId } from '@/lib/emed'
import type { SignupRequest } from './validation'

export interface EmedIntegrationResult {
  success: boolean
  patientId?: string | null
  error?: string
}

export async function handleEmedIntegration(
  userId: string,
  body: SignupRequest
): Promise<EmedIntegrationResult> {
  try {
    console.log('Starting eMed integration for user:', userId)
    
    // Use email as fallback NIC if not provided
    const nic = body.nic || body.email

    const emedResult = await createOrGetEmedPatient(
      {
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
        sex: body.sex
      },
      nic,
      body.email
    )

    if (!emedResult.success || !emedResult.patientId) {
      console.error('eMed patient creation failed:', emedResult.error)
      return {
        success: false,
        patientId: null,
        error: emedResult.error || 'Failed to create eMed patient'
      }
    }

    // Update user profile with eMed patient ID
    const updateResult = await updateUserEmedPatientId(userId, emedResult.patientId)
    if (!updateResult.success) {
      console.error('Failed to update user profile with eMed patient ID:', updateResult.error)
      // Continue - patient was created successfully, profile update can be retried later
    }

    console.log('eMed integration completed successfully. Patient ID:', emedResult.patientId)
    
    return {
      success: true,
      patientId: emedResult.patientId
    }
  } catch (error) {
    console.error('eMed integration error:', error)
    return {
      success: false,
      patientId: null,
      error: error instanceof Error ? error.message : 'eMed integration failed'
    }
  }
}