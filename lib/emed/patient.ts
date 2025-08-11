import type { PatientInput } from '@/data/types'
import { medplumService } from './emed-service'

/**
 * eMed Patient Service - Centralized patient management for eMed integration
 * Handles creating/finding patients and managing patient IDs in user profiles
 */

export interface EmedPatientResult {
    success: boolean
    patientId?: string
    isNewPatient?: boolean
    error?: string
}

/**
 * Create or get existing patient from eMed system
 * Returns patient ID that should be saved to user profile
 */
export async function createOrGetEmedPatient(
    userProfileData: {
        first_name: string
        last_name: string
        date_of_birth: string
        phone: string
        address: any
        sex: string
    },
    nic: string,
    email: string
): Promise<EmedPatientResult> {
    try {
        // Convert user profile data to PatientInput format
        const patientData: PatientInput = {
            firstName: userProfileData.first_name,
            lastName: userProfileData.last_name,
            dateOfBirth: userProfileData.date_of_birth,
            phone: userProfileData.phone,
            email,
            nic,
            address: {
                street: userProfileData.address.street,
                city: userProfileData.address.city,
                district: userProfileData.address.district,
                postalCode: userProfileData.address.postcode,
                country: userProfileData.address.country || 'Sri Lanka'
            },
            gender: userProfileData.sex as 'male' | 'female'
        }

        // Try to find existing patient first
        const existingPatient = await medplumService.findPatientByNicOrEmail(nic, email)

        if (existingPatient?.id) {
            // Update patient with latest data
            await medplumService.updatePatient(patientData, existingPatient)

            return {
                success: true,
                patientId: existingPatient.id,
                isNewPatient: false
            }
        }

        // Create new patient
        const patientId = await medplumService.createPatient(patientData)

        return {
            success: true,
            patientId,
            isNewPatient: true
        }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}

/**
 * Test connection to eMed system
 */
export async function testEmedConnection(): Promise<boolean> {
    try {
        return await medplumService.testConnection()
    } catch (error) {
        console.error('❌ eMed connection test failed:', error)
        return false
    }
}

/**
 * Get eMed configuration info
 */
export function getEmedConfig() {
    return medplumService.getConfigInfo()
}