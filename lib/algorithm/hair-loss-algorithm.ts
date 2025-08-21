import type { HealthVerticalAlgorithm, AlgorithmInput, BaseRecommendationResult } from './types'

// Import the existing hair loss logic
import recommendTreatment, { type PatientData, type RecommendationResult } from './hairloss-recommendations'

/**
 * Hair Loss Algorithm Implementation
 */
export class HairLossAlgorithm implements HealthVerticalAlgorithm {
    healthVertical = 'hair-loss'

    processRecommendations(input: AlgorithmInput): BaseRecommendationResult {
        // Map responses to patient data format
        const patientData = this.mapResponsesToPatientData(input.responses, input.questions)
        
        // Use existing hair loss algorithm
        const result = recommendTreatment(patientData)
        
        // Convert to standard format
        return this.convertToBaseResult(result)
    }

    validateResponses(responses: Record<string, any>, questions: any[]): boolean {
        // Check for required fields for hair loss algorithm
        const requiredFields = ['age', 'gender']
        
        for (const field of requiredFields) {
            // Find question by property
            const question = questions.find(q => q.question_property === field)
            if (question && !responses[question.id]) {
                return false
            }
        }
        
        return true
    }

    mapResponsesToPatientData(responses: Record<string, any>, questions: any[]): PatientData {
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

        // Convert to PatientData format with defaults
        return {
            age: parseInt(mappedData.age) || 25,
            gender: mappedData.gender || 'Male',
            hairLossAreas: Array.isArray(mappedData.hairLossAreas) ? mappedData.hairLossAreas : [],
            hairLossOnset: mappedData.hairLossOnset || '',
            hairLossProgression: mappedData.hairLossProgression || '',
            familyHistory: mappedData.familyHistory || '',
            familyHistoryAge: mappedData.familyHistoryAge,
            medicalConditions: Array.isArray(mappedData.medicalConditions) ? mappedData.medicalConditions : [],
            otherMedicalConditions: mappedData.otherMedicalConditions,
            medications: mappedData.medications || '',
            medicationsList: mappedData.medicationsList,
            previousTreatments: mappedData.previousTreatments || '',
            previousTreatmentsDetails: mappedData.previousTreatmentsDetails,
            treatmentGoals: Array.isArray(mappedData.treatmentGoals) ? mappedData.treatmentGoals : [],
            importance: parseInt(mappedData.importance) || 5,
            commitment: mappedData.commitment || '',
            photos: [] // Photos handled separately in the system
        }
    }

    private convertToBaseResult(result: RecommendationResult): BaseRecommendationResult {
        const canPurchase = 
            result.recommendation === 'Minoxidil 5% Standalone' ||
            result.recommendation === 'Minoxidil + Finasteride Spray'

        let productSlug: string | undefined
        if (canPurchase) {
            if (result.recommendation === 'Minoxidil 5% Standalone') {
                productSlug = process.env.NEXT_PUBLIC_GENIE_MINOXIDIL_TOPICAL_PRODUCT_ID
            } else if (result.recommendation === 'Minoxidil + Finasteride Spray') {
                productSlug = process.env.NEXT_PUBLIC_GENIE_COMBINATION_SPRAY_PRODUCT_ID
            }
        }

        return {
            recommendation: result.recommendation,
            message: result.message,
            canPurchase,
            productSlug,
            redirectPath: canPurchase && productSlug ? `/products/${productSlug}?recommended=true&from=quiz` : undefined
        }
    }
}

// Export instance for registration
export const hairLossAlgorithm = new HairLossAlgorithm()