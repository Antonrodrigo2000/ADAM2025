import type { Patient, Binary, QuestionnaireResponse } from '@medplum/fhirtypes'
import type { PatientInput, PhotoInput, QuestionnaireInput } from '@/data/types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const FHIR_CONFIG = {
    DEFAULT_COUNTRY: 'Sri Lanka',
    NIC_SYSTEM: 'http://fhir.health.gov.lk/ips/identifier/nic',
    NIC_TYPE_SYSTEM: 'http://fhir.health.gov.lk/ips/CodeSystem/cs-identifier-types',
    DISTRICT_EXTENSION_URL: 'https://api.emed.lk/StructureDefinition/district',
    ADAM_HEALTH_SYSTEM: 'https://api.emed.lk/adam-health/customer-id',
    CUSTOMER_ID_SYSTEM: 'http://terminology.hl7.org/CodeSystem/v2-0203',
    ADAM_HEALTH_ORGANIZATION_ID: '019873c3-14e8-7306-9a3b-509c078689e0',
}

/**
 * Add meta compartment with Adam Health organization to a resource
 * Preserves existing compartments and adds the organization if not present
 */
function addMetaCompartment<T extends { meta?: any }>(resource: T): T {
    if (!resource.meta) {
        resource.meta = {}
    }

    if (!resource.meta.compartment) {
        resource.meta.compartment = []
    }

    // Check if Adam Health organization is already in compartments
    const hasAdamHealthOrg = resource.meta.compartment.some(
        (comp: any) => comp.reference === `Organization/${FHIR_CONFIG.ADAM_HEALTH_ORGANIZATION_ID}`
    )

    // Add Adam Health organization if not present
    if (!hasAdamHealthOrg) {
        resource.meta.compartment.push({
            reference: `Organization/${FHIR_CONFIG.ADAM_HEALTH_ORGANIZATION_ID}`
        })
    }

    return resource
}

/**
 * Build FHIR Patient resource from form data
 */
export function buildPatientResource(patientData: PatientInput, existingId?: string): Patient {

    const patient: Patient = {
        resourceType: 'Patient',
        name: [
            {
                use: 'official',
                given: [patientData.firstName],
                family: patientData.lastName,
            },
        ],
        gender: patientData.gender,
        birthDate: patientData.dateOfBirth,
        telecom: [
            { system: 'phone', value: patientData.phone, use: 'mobile' },
            { system: 'email', value: patientData.email, use: 'home' },
        ],
        identifier: [],
        address: [
            {
                line: [patientData.address.street],
                city: patientData.address.city,
                postalCode: patientData.address.postalCode,
                country: patientData.address.country || FHIR_CONFIG.DEFAULT_COUNTRY,
                extension: [
                    {
                        url: FHIR_CONFIG.DISTRICT_EXTENSION_URL,
                        valueString: patientData.address.district,
                    }
                ]
            }
        ]
    }

    // Add NIC identifier (matching emedphr structure)
    if (patientData.nic) {
        patient.identifier?.push({
            system: FHIR_CONFIG.NIC_SYSTEM,
            value: patientData.nic,
            type: {
                coding: [{
                    system: FHIR_CONFIG.NIC_TYPE_SYSTEM,
                    code: "NIC",
                }],
                text: "National Identity Card"
            }
        });
    }

    // Add Customer ID if provided (proper FHIR CodeableConcept)
    if (patientData.adamHealthId) {
        patient.identifier?.push({
            use: 'secondary',
            type: {
                coding: [{
                    system: FHIR_CONFIG.CUSTOMER_ID_SYSTEM,
                    code: 'CUST',
                    display: 'Customer ID'
                }],
                text: 'Adam Health Customer ID'
            },
            system: FHIR_CONFIG.ADAM_HEALTH_SYSTEM,
            value: patientData.adamHealthId,
        })
    }

    if (existingId) {
        patient.id = existingId
    }

    // Add meta compartment with Adam Health organization
    return addMetaCompartment(patient)
}


/**
 * Build PATCH operation for Patient resource - only update address and add new identifiers
 */
export function buildPatientPatch(patientData: PatientInput, existingPatient: Patient): any[] {

    if (!existingPatient.id) {
        throw new Error('Existing patient must have an ID for PATCH')
    }

    const patchOperations: any[] = []

    // Operation 1: Update address
    patchOperations.push({
        op: 'replace',
        path: '/address',
        value: [{
            line: [patientData.address.street],
            city: patientData.address.city,
            postalCode: patientData.address.postalCode,
            country: patientData.address.country || FHIR_CONFIG.DEFAULT_COUNTRY,
            extension: [
                {
                    url: FHIR_CONFIG.DISTRICT_EXTENSION_URL,
                    valueString: patientData.address.district,
                }
            ]
        }]
    })

    // Operation 2: Add NIC identifier if not already present
    const hasNic = existingPatient.identifier?.some(id =>
        id.system === FHIR_CONFIG.NIC_SYSTEM
    )

    if (patientData.nic && !hasNic) {
        patchOperations.push({
            op: 'add',
            path: '/identifier',
            value: {
                system: FHIR_CONFIG.NIC_SYSTEM,
                value: patientData.nic,
                type: {
                    coding: [{
                        system: FHIR_CONFIG.NIC_TYPE_SYSTEM,
                        code: "NIC",
                    }],
                    text: "National Identity Card"
                }
            }
        })
    }

    // Operation 3: Add Adam Health ID if provided and not already present
    const hasAdamHealthId = existingPatient.identifier?.some(id =>
        id.system === FHIR_CONFIG.ADAM_HEALTH_SYSTEM
    )

    if (patientData.adamHealthId && !hasAdamHealthId) {
        patchOperations.push({
            op: 'add',
            path: '/identifier',
            value: {
                use: 'secondary',
                type: {
                    coding: [{
                        system: FHIR_CONFIG.CUSTOMER_ID_SYSTEM,
                        code: 'CUST',
                        display: 'Customer ID'
                    }],
                    text: 'Adam Health Customer ID'
                },
                system: FHIR_CONFIG.ADAM_HEALTH_SYSTEM,
                value: patientData.adamHealthId,
            }
        })
    }

    // Operation 4: Add Adam Health organization to meta.compartment if not present
    const hasAdamHealthOrg = existingPatient.meta?.compartment?.some(
        (comp: any) => comp.reference === `Organization/${FHIR_CONFIG.ADAM_HEALTH_ORGANIZATION_ID}`
    )

    if (!hasAdamHealthOrg) {
        // Initialize meta.compartment if it doesn't exist
        if (!existingPatient.meta?.compartment) {
            patchOperations.push({
                op: 'add',
                path: '/meta/compartment',
                value: [{
                    reference: `Organization/${FHIR_CONFIG.ADAM_HEALTH_ORGANIZATION_ID}`
                }]
            })
        } else {
            // Add to existing compartment array
            patchOperations.push({
                op: 'add',
                path: '/meta/compartment',
                value: {
                    reference: `Organization/${FHIR_CONFIG.ADAM_HEALTH_ORGANIZATION_ID}`
                }
            })
        }
    }


    return patchOperations
}

/**
 * Build FHIR Binary resource from photo data
 */
export function buildBinaryResource(photo: PhotoInput, patientRef?: string, id?: string): Binary {

    // Validate data
    if (!photo.dataBase64 || photo.dataBase64.length === 0) {
        throw new Error('Binary data is empty or missing')
    }

    // Check size limits (Medplum typically has limits)
    const dataSizeInMB = photo.dataBase64.length * 0.75 / 1024 / 1024 // Approximate size
    if (dataSizeInMB > 10) { // 10MB limit
        throw new Error(`Binary data too large: ${dataSizeInMB.toFixed(2)}MB (max 10MB)`)
    }

    const binary: Binary = {
        resourceType: 'Binary',
        contentType: photo.contentType,
        data: photo.dataBase64,
    }

    // Add security context if patient reference is provided
    if (patientRef) {
        binary.securityContext = {
            reference: patientRef
        }
    }

    if (id) {
        binary.id = id
    }


    // Add meta compartment with Adam Health organization
    return addMetaCompartment(binary)
}

// ============================================================================
// QUESTIONNAIRE RESPONSE BUILDERS
// ============================================================================

/**
 * Build FHIR QuestionnaireResponse resource
 */
export function buildQuestionnaireResponse(
    questionnaireId: string,
    patientRef: string,
    answers: any[]
): QuestionnaireResponse {

    const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        subject: {
            reference: patientRef,
        },
        questionnaire: `Questionnaire/${questionnaireId}`,
        item: answers.map(answer => ({
            linkId: answer.linkId,
            text: answer.text, // Add question text
            answer: answer.answer
        })),
    }

    // Add meta compartment with Adam Health organization
    return addMetaCompartment(questionnaireResponse)
}


/**
 * Build questionnaire input from database questions using question_property as linkId
 * This is the new preferred method that properly maps database questions to FHIR format
 */
export function buildQuestionnaireInputFromDatabase(
    quizResponses: Record<string, any>,
    questions: any[],
    photos: PhotoInput[],
    assessmentType: string,
    cartItems?: any[],
    organizationId?: string,
    customerId?: string
): QuestionnaireInput {

    const questionnaireId = assessmentType === 'hair-loss' ? 'hair-loss-questionnaire' : 'erectile-dysfunction-questionnaire'

    // Create a map of question IDs to their properties and metadata
    const questionMap = new Map<string, { property: string; text: string; type: string }>()
    questions.forEach(q => {
        questionMap.set(q.id, {
            property: q.question_property,
            text: q.question_text,
            type: q.question_type
        })
    })

    const answers: any[] = []

    // Convert each quiz response to FHIR format using question_property as linkId
    Object.entries(quizResponses).forEach(([questionId, response]) => {
        const questionInfo = questionMap.get(questionId)
        if (!questionInfo) {
            return
        }

        const answer: any = {
            linkId: questionInfo.property, // Use question_property as linkId
            text: questionInfo.text, // Add actual question text
            answer: []
        }

        // Handle different response types based on question type and response data
        if (questionInfo.type === 'file') {
            // Handle file uploads - use photos that were uploaded to Medplum
            // Match photos by questionId (preferred) or fall back to description matching
            const questionPhotos = photos.filter(photo => 
                photo.questionId === questionId || photo.description?.startsWith(questionId)
            )
            if (questionPhotos.length > 0) {
                answer.answer = questionPhotos.map(photo => ({
                    valueString: photo.binaryId // Reference to Binary resource by ID
                }))
            }
        } else if (Array.isArray(response)) {
            // Multiple choice or checkbox responses
            answer.answer = response.map((item: any) => {
                if (typeof item === 'string') {
                    return { valueString: item }
                } else if (typeof item === 'number') {
                    return { valueInteger: item }
                } else if (typeof item === 'boolean') {
                    return { valueBoolean: item }
                }
                return { valueString: String(item) }
            })
        } else if (typeof response === 'string') {
            answer.answer = [{ valueString: response }]
        } else if (typeof response === 'number') {
            answer.answer = [{ valueInteger: response }]
        } else if (typeof response === 'boolean') {
            answer.answer = [{ valueBoolean: response }]
        } else {
            // Fallback for any other type
            answer.answer = [{ valueString: String(response) }]
        }

        if (answer.answer.length > 0) {
            answers.push(answer)
        }
    })

    // Add cart items as a single questionnaire item
    if (cartItems && cartItems.length > 0) {
        // Create linkId in format: organizationId_customerId_cart
        const cartLinkId = organizationId && customerId 
            ? `${organizationId}_${customerId}_cart`
            : 'cart'
        
        const cartAnswer: any = {
            linkId: cartLinkId,
            text: 'Selected products for purchase',
            answer: cartItems.map(item => ({
                valueString: item.productId // All product IDs as separate answer items
            }))
        }
        answers.push(cartAnswer)
    }

    return {
        questionnaireId,
        answers
    }
}
