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

// ============================================================================
// META COMPARTMENT HELPER
// ============================================================================

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

// ============================================================================
// PATIENT RESOURCE BUILDERS
// ============================================================================

/**
 * Build FHIR Patient resource from form data
 */
export function buildPatientResource(patientData: PatientInput, existingId?: string): Patient {
  console.log('🏗️ Building Patient resource:', { patientData, existingId })
  
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
 * Build FHIR Patient resource for update, preserving immutable fields
 */
export function buildPatientResourceForUpdate(patientData: PatientInput, existingPatient: Patient): Patient {
  console.log('🏗️ Building Patient resource for update:', { patientData, existingPatient })

  if (!existingPatient.id) {
    throw new Error('Existing patient must have an ID for update')
  }

  const patient: Patient = {
    resourceType: 'Patient',
    id: existingPatient.id, // Preserve existing ID
    name: existingPatient.name || [], // Preserve existing name
    telecom: existingPatient.telecom || [], // Preserve existing telecom
    identifier: existingPatient.identifier || [], // Preserve existing identifiers
    address: [ // Update only address
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

  // Only include optional fields if they exist in the existing patient
  if (existingPatient.gender) {
    patient.gender = existingPatient.gender
  }
  if (existingPatient.birthDate) {
    patient.birthDate = existingPatient.birthDate
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

  console.log('✅ Patient resource for update built:', {
    id: patient.id,
    name: patient.name,
    gender: patient.gender,
    birthDate: patient.birthDate,
    hasNewNic: !!patientData.nic,
    hasNewAdamHealthId: !!patientData.adamHealthId
  })

  // Add meta compartment with Adam Health organization
  return addMetaCompartment(patient)
}

/**
 * Build PATCH operation for Patient resource - only update address and add new identifiers
 */
export function buildPatientPatch(patientData: PatientInput, existingPatient: Patient): any[] {
  console.log('🏗️ Building Patient PATCH operation:', { patientData, existingPatient })

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

  console.log('✅ Patient PATCH operations built:', {
    operationsCount: patchOperations.length,
    hasAddressUpdate: patchOperations.some(op => op.path === '/address'),
    hasNewNic: patchOperations.some(op => op.path === '/identifier' && op.value?.system?.includes('nic')),
    hasNewAdamHealthId: patchOperations.some(op => op.path === '/identifier' && op.value?.system?.includes('adam-health')),
    hasMetaCompartment: patchOperations.some(op => op.path === '/meta/compartment')
  })

  return patchOperations
}

// ============================================================================
// BINARY RESOURCE BUILDERS
// ============================================================================

/**
 * Build FHIR Binary resource from photo data
 */
export function buildBinaryResource(photo: PhotoInput, patientRef?: string, id?: string): Binary {
  console.log('🏗️ Building Binary resource for photo:', { 
    contentType: photo.contentType, 
    description: photo.description,
    dataLength: photo.dataBase64?.length || 0,
    patientRef
  })
  
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

  console.log('✅ Binary resource created:', {
    resourceType: binary.resourceType,
    contentType: binary.contentType,
    dataLength: binary.data?.length || 0,
    dataSizeInMB: dataSizeInMB.toFixed(2),
    hasSecurityContext: !!binary.securityContext
  })

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
  console.log('🏗️ Building QuestionnaireResponse:', { questionnaireId, patientRef, answersCount: answers.length })
  
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
 * Build questionnaire input with updated photo references
 */
export function buildQuestionnaireInput(questionnaireData: any, photos: PhotoInput[], assessmentType: string): QuestionnaireInput {
  const questionnaireId = assessmentType === 'hair-loss' ? 'hair-loss-questionnaire' : 'erectile-dysfunction-questionnaire'
  
  const answers = assessmentType === 'hair-loss' ? [
    {
      linkId: 'q1', // Age
      answer: [{ valueInteger: questionnaireData.q1 }],
    },
    {
      linkId: 'q2', // Gender
      answer: [{ valueString: questionnaireData.q2 }],
    },
    {
      linkId: 'q3', // Hair Loss Areas
      answer: questionnaireData.q3.map((area: string) => ({ valueString: area })),
    },
    {
      linkId: 'q4', // Hair Loss Timing
      answer: [{ valueString: getDisplayLabel('q4', questionnaireData.q4, assessmentType) }],
    },
    {
      linkId: 'q5', // Hair Loss Progression
      answer: [{ valueString: getDisplayLabel('q5', questionnaireData.q5, assessmentType) }],
    },
    {
      linkId: 'q6', // Family History
      answer: [{ valueString: questionnaireData.q6 }],
    },
    ...(questionnaireData.q6 === 'yes' && questionnaireData.q7 ? [{
      linkId: 'q7', // Family History Age
      answer: [{ valueString: questionnaireData.q7 }],
    }] : []),
    {
      linkId: 'q8', // Medical Conditions
      answer: questionnaireData.q8.map((condition: string) => ({ valueString: condition })),
    },
    ...(questionnaireData.q8?.includes('Other medical conditions') && questionnaireData.q9 ? [{
      linkId: 'q9', // Other Medical Conditions
      answer: [{ valueString: questionnaireData.q9 }],
    }] : []),
    {
      linkId: 'q10', // Current Medications
      answer: [{ valueString: questionnaireData.q10 }],
    },
    ...(questionnaireData.q10 === 'yes' && questionnaireData.q11 ? [{
      linkId: 'q11', // Medications List
      answer: [{ valueString: questionnaireData.q11 }],
    }] : []),
    {
      linkId: 'q12', // Previous Treatments
      answer: [{ valueString: questionnaireData.q12 }],
    },
    ...(questionnaireData.q12 === 'yes' && questionnaireData.q13 ? [{
      linkId: 'q13', // Previous Treatments Description
      answer: [{ valueString: questionnaireData.q13 }],
    }] : []),
    {
      linkId: 'q14', // Treatment Goals
      answer: questionnaireData.q14.map((goal: string) => ({ valueString: goal })),
    },
    {
      linkId: 'q15', // Treatment Importance
      answer: [{ valueInteger: questionnaireData.q15 }],
    },
    {
      linkId: 'q16', // Willing to Follow Routine
      answer: [{ valueString: questionnaireData.q16 }],
    },
    {
      linkId: 'q17', // Scalp Photos
      answer: photos.map((photo) => ({
        valueAttachment: {
          contentType: photo.contentType,
          url: `Binary/${photo.binaryId}`,
        }
      })),
    },
    {
      linkId: 'q18', // Severity Score
      answer: [{ valueInteger: questionnaireData.q18 }],
    },
    {
      linkId: 'q19', // Risk Level
      answer: [{ valueInteger: questionnaireData.q19 }],
    },
    {
      linkId: 'q20', // Immediate Specialist Referral
      answer: [{ valueString: questionnaireData.q20 }],
    },
  ] : [
    {
      linkId: 'q1', // Age
      answer: [{ valueInteger: questionnaireData.q1 }],
    },
    {
      linkId: 'q2', // Gender
      answer: [{ valueString: questionnaireData.q2 }],
    },
    {
      linkId: 'q3', // Symptoms Duration
      answer: [{ valueString: getDisplayLabel('q3', questionnaireData.q3, assessmentType) }],
    },
    {
      linkId: 'q4', // Erection Quality
      answer: [{ valueString: getDisplayLabel('q4', questionnaireData.q4, assessmentType) }],
    },
    {
      linkId: 'q5', // Morning Erections
      answer: [{ valueString: getDisplayLabel('q5', questionnaireData.q5, assessmentType) }],
    },
    {
      linkId: 'q6', // Sexual Desire
      answer: [{ valueString: getDisplayLabel('q6', questionnaireData.q6, assessmentType) }],
    },
    {
      linkId: 'q7', // Relationship Stress
      answer: [{ valueString: getDisplayLabel('q7', questionnaireData.q7, assessmentType) }],
    },
    {
      linkId: 'q8', // Medical Conditions
      answer: questionnaireData.q8.map((condition: string) => ({ valueString: condition })),
    },
    ...(questionnaireData.q8?.includes('Other medical conditions') && questionnaireData.q9 ? [{
      linkId: 'q9', // Other Medical Conditions
      answer: [{ valueString: questionnaireData.q9 }],
    }] : []),
    {
      linkId: 'q10', // Current Medications
      answer: [{ valueString: questionnaireData.q10 }],
    },
    ...(questionnaireData.q10 === 'yes' && questionnaireData.q11 ? [{
      linkId: 'q11', // Medications List
      answer: [{ valueString: questionnaireData.q11 }],
    }] : []),
    {
      linkId: 'q12', // Previous Treatments
      answer: [{ valueString: questionnaireData.q12 }],
    },
    ...(questionnaireData.q12 === 'yes' && questionnaireData.q13 ? [{
      linkId: 'q13', // Previous Treatments Description
      answer: [{ valueString: questionnaireData.q13 }],
    }] : []),
    {
      linkId: 'q14', // Treatment Goals
      answer: questionnaireData.q14.map((goal: string) => ({ valueString: goal })),
    },
    {
      linkId: 'q15', // Treatment Importance
      answer: [{ valueInteger: questionnaireData.q15 }],
    },
    {
      linkId: 'q16', // Willing to Follow Routine
      answer: [{ valueString: questionnaireData.q16 }],
    },
    {
      linkId: 'q17', // Severity Score
      answer: [{ valueInteger: questionnaireData.q17 }],
    },
    {
      linkId: 'q18', // Risk Level
      answer: [{ valueInteger: questionnaireData.q18 }],
    },
    {
      linkId: 'q19', // Immediate Specialist Referral
      answer: [{ valueString: questionnaireData.q19 }],
    },
  ]

  return {
    questionnaireId,
    answers,
  }
}

/**
 * Get display label for a select field value
 */
function getDisplayLabel(linkId: string, value: string, assessmentType: string): string {
  const config = assessmentType === 'hair-loss' ? {
    q4: {
      'less_than_6_months': 'Less than 6 months ago',
      '6_months_to_1_year': '6 months to 1 year ago',
      '1_to_5_years': '1 to 5 years ago',
      'more_than_5_years': 'More than 5 years ago'
    },
    q5: {
      'slowly': 'Slowly',
      'moderately': 'Moderately',
      'quickly': 'Quickly'
    }
  } : {
    q3: {
      'less_than_3_months': 'Less than 3 months',
      '3_to_6_months': '3 to 6 months',
      '6_months_to_1_year': '6 months to 1 year',
      'more_than_1_year': 'More than 1 year'
    },
    q4: {
      'never': 'Never',
      'rarely': 'Rarely',
      'sometimes': 'Sometimes',
      'often': 'Often',
      'always': 'Always'
    },
    q5: {
      'never': 'Never',
      'rarely': 'Rarely',
      'sometimes': 'Sometimes',
      'often': 'Often',
      'always': 'Always'
    },
    q6: {
      'very_low': 'Very Low',
      'low': 'Low',
      'moderate': 'Moderate',
      'high': 'High',
      'very_high': 'Very High'
    },
    q7: {
      'none': 'None',
      'mild': 'Mild',
      'moderate': 'Moderate',
      'severe': 'Severe'
    }
  }

  const fieldConfig = config[linkId as keyof typeof config]
  return fieldConfig?.[value as keyof typeof fieldConfig] || value
}

/**
 * Build questionnaire input from database questions using question_property as linkId
 * This is the new preferred method that properly maps database questions to FHIR format
 */
export function buildQuestionnaireInputFromDatabase(
  quizResponses: Record<string, any>,
  questions: any[],
  photos: PhotoInput[],
  assessmentType: string
): QuestionnaireInput {
  console.log('🏗️ Building QuestionnaireInput from database questions:', {
    questionsCount: questions.length,
    photosCount: photos.length,
    assessmentType
  })

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
      console.warn(`Question ${questionId} not found in database questions`)
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
      const questionPhotos = photos.filter(photo => photo.description?.startsWith(questionId))
      if (questionPhotos.length > 0) {
        answer.answer = questionPhotos.map(photo => ({
          valueAttachment: {
            contentType: photo.contentType,
            url: `Binary/${photo.binaryId}`,
          }
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

  console.log('✅ Built QuestionnaireInput with', answers.length, 'answers using question properties as linkIds')

  return {
    questionnaireId,
    answers
  }
}
