import type { Patient, Bundle } from '@medplum/fhirtypes'
import type { PatientInput, PhotoInput } from '@/data/types'
import {
    buildPatientResource,
    buildPatientPatch,
    buildBinaryResource,
    buildQuestionnaireResponse,
    buildQuestionnaireInputFromDatabase
} from './fhir-builders'
import { createMedplumClient } from '@/lib/medplum/client'
import { compressExistingPhotoInput, validatePhotoInputForMedplum } from './image-compressor'

export interface MedplumResponse {
    success: boolean
    patientId?: string
    questionnaireResponseId?: string
    binaryIds?: string[]
    error?: string
    bundle?: Bundle
    compressionInfo?: Array<{
        originalSize: string
        compressedSize: string
        wasCompressed: boolean
        compressionRatio?: number
    }>
}

export class MedplumService {

    /**
     * Find existing patient by NIC or email
     */
    async findPatientByNicOrEmail(nic: string, email: string): Promise<Patient | undefined> {
        try {
            const medplum = await createMedplumClient();

            const nicSearch = await medplum.search('Patient', {
                identifier: `http://fhir.health.gov.lk/ips/identifier/nic|${nic}`,
            })

            if (nicSearch.entry && nicSearch.entry.length > 0 && nicSearch.entry[0]?.resource) {
                return nicSearch.entry[0].resource as Patient
            }

            const emailSearch = await medplum.search('Patient', {
                telecom: `email|${email}`,
            })

            if (emailSearch.entry && emailSearch.entry.length > 0 && emailSearch.entry[0]?.resource) {
                return emailSearch.entry[0].resource as Patient
            }
            return undefined
        } catch (error) {
            throw new Error(`Failed to search for patient: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Create new patient
     */
    async createPatient(patientData: PatientInput): Promise<string> {
        const medplum = await createMedplumClient();

        const patientResource = buildPatientResource(patientData)
        const createdPatient = await medplum.createResource(patientResource)

        return createdPatient.id
    }

    /**
     * Update existing patient using PATCH
     */
    async updatePatient(patientData: PatientInput, existingPatient: Patient): Promise<void> {
        const medplum = await createMedplumClient();

        const patchOperations = buildPatientPatch(patientData, existingPatient)
        await medplum.patchResource('Patient', existingPatient.id!, patchOperations)
    }


    /**
     * Create Binary resource for photo
     */
    async createBinaryResource(
        photo: PhotoInput,
        patientRef: string
    ): Promise<string> {
        const medplum = await createMedplumClient();

        const binaryResource = buildBinaryResource(photo, patientRef)
        const createdBinary = await medplum.createResource(binaryResource)

        return createdBinary.id
    }

    /**
     * Create QuestionnaireResponse
     */
    async createQuestionnaireResponse(
        questionnaireId: string,
        patientRef: string,
        answers: any[]
    ): Promise<string> {
        const medplum = await createMedplumClient();

        console.log('Creating QuestionnaireResponse with answers:', answers)

        const questionnaireResponse = buildQuestionnaireResponse(questionnaireId, patientRef, answers)
        const createdQuestionnaireResponse = await medplum.createResource(questionnaireResponse)

        console.log('Created QuestionnaireResponse:', createdQuestionnaireResponse)

        return createdQuestionnaireResponse.id!
    }

    /**
     * Save questionnaire and cart data to FHIR server with automatic image compression
     */
    async saveQuestionnaireAndCart(
        patientId: string,
        photos: PhotoInput[],
        questionnaireData: { quizResponses: Record<string, any>; questions: any[] },
        cartItems: any[]
    ): Promise<MedplumResponse> {
        try {
            const binaryIds: string[] = []
            const patientRef = `Patient/${patientId}`

            // Process photos with compression and create Binary resources
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i]
                if (!photo) continue

                // Use the method that returns compression info
                const result = await this.createBinaryResource(photo, patientRef)

                binaryIds.push(result)
                photo.binaryId = result
            }

            console.log('Processed photos:', binaryIds, 'with compression info:')

            // Build questionnaire input using database questions with proper linkId and text
            const questionnaireInput = buildQuestionnaireInputFromDatabase(
                questionnaireData.quizResponses,
                questionnaireData.questions,
                photos,
                'hair-loss',
                cartItems,
                process.env.EMED_ADAM_HEALTH_ORGANIZATION_ID,
                patientId // Use patientId as customerId
            )

            // Create QuestionnaireResponse with patient reference
            const questionnaireResponseId = await this.createQuestionnaireResponse(
                questionnaireInput.questionnaireId,
                patientRef,
                questionnaireInput.answers
            )

            return {
                success: true,
                patientId,
                questionnaireResponseId,
                binaryIds,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            }
        }
    }

    /**
     * Test connection to Medplum server
     */
    async testConnection(): Promise<boolean> {
        const medplum = await createMedplumClient();

        try {
            await medplum.searchResources('Patient', { _count: '1' })
            return true
        } catch (error) {
            return false
        }
    }

    /**
     * Get configuration info
     */
    getConfigInfo() {
        return {
            baseUrl: process.env.MEDPLUM_BASE_URL,
            hasCredentials: !!(process.env.MEDPLUM_CLIENT_ID && process.env.MEDPLUM_CLIENT_SECRET),
            nicSystem: 'http://fhir.health.gov.lk/ips/identifier/nic',
            defaultCountry: 'Sri Lanka'
        }
    }
}

export const medplumService = new MedplumService()