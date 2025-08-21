/**
 * Base types for health vertical algorithms
 */

export interface BaseRecommendationResult {
    recommendation: string
    message: string
    canPurchase: boolean
    productSlug?: string
    redirectPath?: string
}

export interface AlgorithmInput {
    responses: Record<string, any>
    questions: any[]
    healthVertical: string
}

export interface HealthVerticalAlgorithm {
    /**
     * The health vertical slug this algorithm handles
     */
    healthVertical: string
    
    /**
     * Process questionnaire responses and return recommendations
     */
    processRecommendations(input: AlgorithmInput): BaseRecommendationResult
    
    /**
     * Validate if the responses are complete for this algorithm
     */
    validateResponses(responses: Record<string, any>, questions: any[]): boolean
    
    /**
     * Map questionnaire responses to algorithm-specific patient data format
     */
    mapResponsesToPatientData(responses: Record<string, any>, questions: any[]): any
}

/**
 * Common recommendation types
 */
export const RECOMMENDATION_TYPES = {
    APPROVED: 'approved',
    CONSULTATION_REQUIRED: 'consultation_required', 
    DENIED: 'denied',
    SPECIALIST_REFERRAL: 'specialist_referral'
} as const

export type RecommendationType = typeof RECOMMENDATION_TYPES[keyof typeof RECOMMENDATION_TYPES]