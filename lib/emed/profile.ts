import { createClient } from '@/lib/supabase/server'

/**
 * eMed Profile Service - Manages eMed patient ID in user profiles
 */

export interface UpdateEmedPatientIdResult {
    success: boolean
    error?: string
}

/**
 * Update user profile with eMed patient ID
 */
export async function updateUserEmedPatientId(
    userId: string,
    emedPatientId: string
): Promise<UpdateEmedPatientIdResult> {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('user_profiles')
            .update({
                emed_patient_id: emedPatientId,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (error) {
            return {
                success: false,
                error: `Failed to update profile: ${error.message}`
            }
        }

        return { success: true }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}

/**
 * Get user's eMed patient ID from profile
 */
export async function getUserEmedPatientId(userId: string): Promise<string | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('user_profiles')
            .select('emed_patient_id')
            .eq('id', userId)
            .single()

        if (error) {
            return null
        }

        return data?.emed_patient_id || null

    } catch (error) {
        return null
    }
}

/**
 * Check if user has eMed patient ID
 */
export async function userHasEmedPatientId(userId: string): Promise<boolean> {
    const patientId = await getUserEmedPatientId(userId)
    return !!patientId
}