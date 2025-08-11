import type { Patient, Bundle } from '@medplum/fhirtypes'
import type { PatientInput, PhotoInput } from '@/data/types'
import {
    buildPatientResource,
    buildPatientPatch,
    buildBinaryResource,
    buildQuestionnaireResponse,
    buildQuestionnaireInputFromDatabase
} from './build-fhir-resources'
import { createMedplumClient } from '@/lib/medplum/client'
import { compressExistingPhotoInput, validatePhotoInputForMedplum } from './medplum-image-compressor'

// Adam Health Organization ID from FHIR config
const ADAM_HEALTH_ORGANIZATION_ID = '019873c3-14e8-7306-9a3b-509c078689e0'

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
     * Create Binary resource for photo with automatic compression
     */
    async createBinaryResource(photo: PhotoInput, patientRef: string): Promise<string> {
        const result = await this.createBinaryResourceWithCompressionInfo(photo, patientRef)
        return result.binaryId
    }

    /**
     * Create Binary resource for photo with compression tracking
     */
    async createBinaryResourceWithCompressionInfo(
        photo: PhotoInput, 
        patientRef: string
    ): Promise<{
        binaryId: string
        compressionInfo: {
            originalSize: number
            compressedSize: number
            wasCompressed: boolean
            compressionRatio?: number
        }
    }> {
        const medplum = await createMedplumClient();

        // Check original size
        const originalValidation = validatePhotoInputForMedplum(photo)
        const originalSize = originalValidation.size
        let finalPhoto = photo
        let wasCompressed = false
        let compressionRatio: number | undefined

        if (!originalValidation.isValid) {
            // Compress the photo if it doesn't meet requirements
            try {
                const compressionResult = await compressExistingPhotoInput(photo)
                if (compressionResult.meetsRequirements) {
                    finalPhoto = compressionResult.photoInput
                    wasCompressed = true
                    compressionRatio = compressionResult.compressionRatio
                } else {
                    // Even after compression, it might not meet requirements
                    throw new Error(`Image compression failed: ${originalValidation.reason}`)
                }
            } catch (compressionError) {
                throw new Error(`Failed to compress image: ${compressionError instanceof Error ? compressionError.message : 'Unknown compression error'}`)
            }
        }

        const binaryResource = buildBinaryResource(finalPhoto, patientRef)
        const createdBinary = await medplum.createResource(binaryResource)
        const finalSize = finalPhoto.dataBase64.length * 0.75

        return {
            binaryId: createdBinary.id!,
            compressionInfo: {
                originalSize,
                compressedSize: finalSize,
                wasCompressed,
                compressionRatio
            }
        }
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

        const questionnaireResponse = buildQuestionnaireResponse(questionnaireId, patientRef, answers)
        const createdQuestionnaireResponse = await medplum.createResource(questionnaireResponse)

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
            const compressionInfo: MedplumResponse['compressionInfo'] = []
            const patientRef = `Patient/${patientId}`

            // Process photos with compression and create Binary resources
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i]
                if (!photo) continue

                // Use the method that returns compression info
                const result = await this.createBinaryResourceWithCompressionInfo(photo, patientRef)
                
                binaryIds.push(result.binaryId)
                photo.binaryId = result.binaryId

                // Track compression info
                compressionInfo.push({
                    originalSize: `${Math.round(result.compressionInfo.originalSize / 1024)}KB`,
                    compressedSize: `${Math.round(result.compressionInfo.compressedSize / 1024)}KB`,
                    wasCompressed: result.compressionInfo.wasCompressed,
                    compressionRatio: result.compressionInfo.compressionRatio
                })
            }

            // Build questionnaire input using database questions with proper linkId and text
            const questionnaireInput = buildQuestionnaireInputFromDatabase(
                questionnaireData.quizResponses,
                questionnaireData.questions,
                photos,
                'hair-loss',
                cartItems,
                ADAM_HEALTH_ORGANIZATION_ID,
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
                compressionInfo
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