import { createOrGetEmedPatient, updateUserEmedPatientId } from '@/lib/emed'
import { createClient } from '@/lib/supabase/server'
import type { CheckoutRequest } from './validation'
import { submitQuestionnaireAndCart } from './questionnaire-submission'

export interface EmedIntegrationResult {
    success: boolean
    patientId?: string
    isNewPatient?: boolean
    error?: string
}

/**
 * Handle eMed patient creation/retrieval and profile update
 * This runs for both new and existing users who need eMed integration
 */
export async function handleEmedIntegration(
    userId: string,
    checkoutData: CheckoutRequest,
    requiresQuestionnaire: boolean,
    signal?: AbortSignal
): Promise<EmedIntegrationResult> {
    if (signal?.aborted) {
        throw new Error('Operation cancelled')
    }

    try {
        // Get user profile data
        const supabase = await createClient()
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return {
                success: false,
                error: 'Failed to get user profile data'
            }
        }

        // Check if user already has eMed patient ID
        if (profile.emed_patient_id) {
            // For existing patients, only submit questionnaire if required
            if (requiresQuestionnaire) {
                try {
                    await submitQuestionnaireAndCart(profile.emed_patient_id, checkoutData)
                } catch (error) {
                    console.error('Failed to submit questionnaire for existing patient:', error)
                }
            }
            
            return {
                success: true,
                patientId: profile.emed_patient_id,
                isNewPatient: false
            }
        }

        // Create/get patient in eMed system for users without emed_patient_id
        // Use email as fallback NIC if not provided in checkout data
        const nic = (checkoutData as any).nic || checkoutData.email

        const emedResult = await createOrGetEmedPatient(
            {
                first_name: profile.first_name,
                last_name: profile.last_name,
                date_of_birth: profile.date_of_birth,
                phone: profile.phone,
                address: profile.address,
                sex: profile.sex
            },
            nic,
            checkoutData.email
        )

        if (!emedResult.success || !emedResult.patientId) {
            return {
                success: false,
                error: emedResult.error || 'Failed to create eMed patient'
            }
        }

        // Update user profile with eMed patient ID
        const updateResult = await updateUserEmedPatientId(userId, emedResult.patientId)

        if (!updateResult.success) {
            console.error('Failed to update user profile with eMed patient ID:', updateResult.error)
            // Don't fail the entire process if profile update fails - patient was created successfully
        }

        // Submit questionnaire & cart only if required
        if (requiresQuestionnaire) {
            try {
                await submitQuestionnaireAndCart(emedResult.patientId, checkoutData)
            } catch (error) {
                console.error('Failed to submit questionnaire for new patient:', error)
                // Don't fail entire integration if questionnaire submission fails
            }
        }

        return {
            success: true,
            patientId: emedResult.patientId,
            isNewPatient: emedResult.isNewPatient
        }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}