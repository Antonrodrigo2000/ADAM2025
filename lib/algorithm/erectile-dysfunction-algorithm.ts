import type { HealthVerticalAlgorithm, AlgorithmInput, BaseRecommendationResult } from './types'

interface EDPatientData {
    age: number
    gender: string
    edSeverity: string
    edDuration: string
    medicalConditions: string[]
    medications: string[]
    cardiovascularHealth: string
    psychologicalFactors: string
    previousTreatments: string
    treatmentPreference: string
}

/**
 * Erectile Dysfunction Algorithm Implementation
 */
export class ErectileDysfunctionAlgorithm implements HealthVerticalAlgorithm {
    healthVertical = 'erectile-dysfunction'

    processRecommendations(input: AlgorithmInput): BaseRecommendationResult {
        // Map responses to ED patient data format
        const patientData = this.mapResponsesToPatientData(input.responses, input.questions)
        
        // Process ED-specific recommendations
        return this.processEDRecommendations(patientData)
    }

    validateResponses(responses: Record<string, any>, questions: any[]): boolean {
        // Check for required fields for ED algorithm
        const requiredFields = ['age', 'gender', 'edSeverity']
        
        for (const field of requiredFields) {
            // Find question by property
            const question = questions.find(q => q.question_property === field)
            if (question && !responses[question.id]) {
                return false
            }
        }
        
        return true
    }

    mapResponsesToPatientData(responses: Record<string, any>, questions: any[]): EDPatientData {
        // Create a map from question ID to property
        const questionMap = new Map<string, string>()
        questions.forEach(q => {
            questionMap.set(q.id, q.question_property)
        })

        // Map responses by property names
        const mappedData: Record<string, any> = {}
        
        Object.entries(responses).forEach(([questionId, response]) => {
            const property = questionMap.get(questionId)
            if (property) {
                mappedData[property] = response
            }
        })

        // Convert to EDPatientData format with defaults
        return {
            age: parseInt(mappedData.age) || 30,
            gender: mappedData.gender || 'Male',
            edSeverity: mappedData.edSeverity || 'mild',
            edDuration: mappedData.edDuration || '',
            medicalConditions: Array.isArray(mappedData.medicalConditions) ? mappedData.medicalConditions : [],
            medications: Array.isArray(mappedData.medications) ? mappedData.medications : [],
            cardiovascularHealth: mappedData.cardiovascularHealth || '',
            psychologicalFactors: mappedData.psychologicalFactors || '',
            previousTreatments: mappedData.previousTreatments || '',
            treatmentPreference: mappedData.treatmentPreference || ''
        }
    }

    private processEDRecommendations(data: EDPatientData): BaseRecommendationResult {
        // Step 1: Basic eligibility screening
        if (!this.checkBasicEligibility(data)) {
            return {
                recommendation: 'specialist_referral',
                message: 'Based on your responses, we recommend consulting with a specialist for personalized evaluation and treatment options.',
                canPurchase: false,
                redirectPath: '/consultation-required'
            }
        }

        // Step 2: Check for contraindications
        const contraindications = this.checkContraindications(data)
        if (contraindications.hasAbsolute) {
            return {
                recommendation: 'denied',
                message: `Treatment contraindicated due to: ${contraindications.reasons.join(', ')}. Please consult your healthcare provider.`,
                canPurchase: false,
                redirectPath: '/consultation-required'
            }
        }

        // Step 3: Determine appropriate treatment
        const treatment = this.determineTreatment(data, contraindications)
        return treatment
    }

    private checkBasicEligibility(data: EDPatientData): boolean {
        // Basic eligibility checks
        if (data.age < 18 || data.age > 75) return false
        if (data.gender !== 'Male') return false
        
        return true
    }

    private checkContraindications(data: EDPatientData): { hasAbsolute: boolean; hasRelative: boolean; reasons: string[] } {
        const absoluteContras = [
            'Nitrate medications',
            'Severe heart disease',
            'Recent heart attack',
            'Uncontrolled blood pressure',
            'Allergy to sildenafil'
        ]

        const relativeContras = [
            'Mild heart disease',
            'Liver disease',
            'Kidney disease',
            'Blood pressure medications'
        ]

        const reasons: string[] = []
        let hasAbsolute = false
        let hasRelative = false

        // Check medical conditions and medications
        const allConditions = [...data.medicalConditions, ...data.medications]

        for (const condition of allConditions) {
            if (absoluteContras.some(contra => condition.toLowerCase().includes(contra.toLowerCase()))) {
                hasAbsolute = true
                reasons.push(condition)
            } else if (relativeContras.some(contra => condition.toLowerCase().includes(contra.toLowerCase()))) {
                hasRelative = true
                reasons.push(condition)
            }
        }

        return { hasAbsolute, hasRelative, reasons }
    }

    private determineTreatment(data: EDPatientData, contraindications: any): BaseRecommendationResult {
        // For now, this is a simplified version
        // In a real implementation, this would be more complex based on ED severity, patient preferences, etc.

        if (contraindications.hasRelative) {
            return {
                recommendation: 'consultation_required',
                message: `Based on your medical history, a consultation is recommended before starting treatment. Relative contraindications detected: ${contraindications.reasons.join(', ')}.`,
                canPurchase: false,
                redirectPath: '/consultation-required'
            }
        }

        // Standard treatment recommendation
        let productSlug: string | undefined
        let message = ''

        if (data.edSeverity === 'mild' || data.edSeverity === 'moderate') {
            // Recommend standard dose sildenafil
            productSlug = process.env.NEXT_PUBLIC_GENIE_SILDENAFIL_25MG_PRODUCT_ID
            message = 'Recommended: Sildenafil 25mg as needed. Take 30-60 minutes before sexual activity. Do not take more than once daily.'
        } else if (data.edSeverity === 'severe') {
            // Recommend higher dose or consultation
            if (data.age < 50 && data.cardiovascularHealth === 'good') {
                productSlug = process.env.NEXT_PUBLIC_GENIE_SILDENAFIL_50MG_PRODUCT_ID
                message = 'Recommended: Sildenafil 50mg as needed. Take 30-60 minutes before sexual activity. Do not take more than once daily.'
            } else {
                return {
                    recommendation: 'consultation_required',
                    message: 'For severe ED, especially with your age and health profile, a consultation is recommended to determine the most appropriate treatment.',
                    canPurchase: false,
                    redirectPath: '/consultation-required'
                }
            }
        } else {
            return {
                recommendation: 'consultation_required',
                message: 'A consultation is recommended to better understand your condition and provide personalized treatment recommendations.',
                canPurchase: false,
                redirectPath: '/consultation-required'
            }
        }

        return {
            recommendation: 'approved',
            message,
            canPurchase: true,
            productSlug,
            redirectPath: productSlug ? `/products/${productSlug}?recommended=true&from=quiz` : undefined
        }
    }
}

// Export instance for registration
export const erectileDysfunctionAlgorithm = new ErectileDysfunctionAlgorithm()