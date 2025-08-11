import type { Patient, Bundle } from '@medplum/fhirtypes'
import type { PatientInput, PhotoInput } from '@/data/types'
import {
    buildPatientResource,
    buildPatientPatch,
    buildBinaryResource,
    buildQuestionnaireResponse,
    buildQuestionnaireInput,
    buildQuestionnaireInputFromDatabase
} from './build-fhir-resources'
import { createMedplumClient } from '@/lib/medplum/client'

export interface MedplumResponse {
    success: boolean
    patientId?: string
    questionnaireResponseId?: string
    binaryIds?: string[]
    error?: string
    bundle?: Bundle
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
    async createBinaryResource(photo: PhotoInput, patientRef: string): Promise<string> {
        const medplum = await createMedplumClient();

        const binaryResource = buildBinaryResource(photo, patientRef)
        const createdBinary = await medplum.createResource(binaryResource)

        return createdBinary.id!
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
     * Submit questionaire & patient cart to FHIR server using sequential creation
     */
    async createPatientAndQuestionnaireResponse(
        patientId: string,
        photos: PhotoInput[],
        questionnaireData: any,): Promise<MedplumResponse> {
        const medplum = await createMedplumClient();

        const binaryIds: string[] = []
        const patientRef = `Patient/${patientId}`

        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i]
            if (!photo) continue // Skip undefined photos

            console.log(`📸 Creating Binary resource ${i + 1}/${photos.length}`)

            const binaryId = await this.createBinaryResource(photo, patientRef)
            binaryIds.push(binaryId)

            // Update the photo with the binary ID for QuestionnaireResponse reference
            photo.binaryId = binaryId
        }

        // const questionnaireInput = buildQuestionnaireInputFromDatabase(questionnaireData, photos)

        // // 4. Create QuestionnaireResponse with patient reference
        // const questionnaireResponseId = await this.createQuestionnaireResponse(
        //     questionnaireInput.questionnaireId,
        //     patientRef,
        //     questionnaireInput.answers
        // )

        const response: MedplumResponse = {
            success: true,
            patientId,
            // questionnaireResponseId,
            binaryIds,
        }

        return response;
    }


    /**
     * Submit patient data to FHIR server using sequential creation
     */
    async submitPatientData(
        patientData: PatientInput,
        photos: PhotoInput[],
        questionnaireData: any,
        assessmentType: string
    ): Promise<MedplumResponse> {
        try {
            console.log('🚀 Starting patient data submission...')
            console.log('📋 Patient data:', { name: `${patientData.firstName} ${patientData.lastName}`, nic: patientData.nic })
            console.log('📸 Photos:', photos.length)
            console.log('📝 Assessment type:', assessmentType)

            // 1. Find existing patient or create new one
            let existingPatient = await this.findPatientByNicOrEmail(patientData.nic, patientData.email)
            let patientId = existingPatient?.id

            if (!patientId) {
                patientId = await this.createPatient(patientData)
            } else {
                await this.updatePatient(patientData, existingPatient!)
            }

            // 2. Create Binary resources with patient reference
            console.log('📸 Creating Binary resources...')
            const binaryIds: string[] = []
            const patientRef = `Patient/${patientId}`

            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i]
                if (!photo) continue // Skip undefined photos

                console.log(`📸 Creating Binary resource ${i + 1}/${photos.length}`)

                const binaryId = await this.createBinaryResource(photo, patientRef)
                binaryIds.push(binaryId)

                // Update the photo with the binary ID for QuestionnaireResponse reference
                photo.binaryId = binaryId
            }

            // 3. Create questionnaire input with updated photo references
            console.log('📝 Creating questionnaire input...')
            const questionnaireInput = buildQuestionnaireInput(questionnaireData, photos, assessmentType)

            // 4. Create QuestionnaireResponse with patient reference
            const questionnaireResponseId = await this.createQuestionnaireResponse(
                questionnaireInput.questionnaireId,
                patientRef,
                questionnaireInput.answers
            )

            // 5. Build response
            const response: MedplumResponse = {
                success: true,
                patientId,
                questionnaireResponseId,
                binaryIds,
            }

            console.log('✅ All resources created successfully!')
            console.log('📊 Final response:', {
                patientId: response.patientId,
                questionnaireResponseId: response.questionnaireResponseId,
                binaryIds: response.binaryIds
            })

            return response
        } catch (error) {
            console.error('❌ Error submitting patient data:', error)
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
            console.log('Testing connection to Medplum server...')

            await medplum.searchResources('Patient', { _count: '1' })

            console.log('Connection successful')
            return true
        } catch (error) {
            console.error('Connection test failed:', error)
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