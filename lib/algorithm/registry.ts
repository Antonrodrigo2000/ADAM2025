import type { HealthVerticalAlgorithm, AlgorithmInput, BaseRecommendationResult } from './types'

/**
 * Registry for health vertical algorithms
 */
class AlgorithmRegistry {
    private algorithms = new Map<string, HealthVerticalAlgorithm>()

    /**
     * Register an algorithm for a health vertical
     */
    register(algorithm: HealthVerticalAlgorithm): void {
        this.algorithms.set(algorithm.healthVertical, algorithm)
        console.log(`✅ Registered algorithm for health vertical: ${algorithm.healthVertical}`)
    }

    /**
     * Get algorithm for a health vertical
     */
    getAlgorithm(healthVertical: string): HealthVerticalAlgorithm | null {
        return this.algorithms.get(healthVertical) || null
    }

    /**
     * Process recommendations for a health vertical
     */
    processRecommendations(input: AlgorithmInput): BaseRecommendationResult {
        console.log('🔬 Processing recommendations for health vertical:', input.healthVertical)
        console.log('🔬 Available algorithms:', this.getRegisteredVerticals())
        
        const algorithm = this.getAlgorithm(input.healthVertical)
        
        if (!algorithm) {
            console.warn(`⚠️ No algorithm found for health vertical: ${input.healthVertical}`)
            return {
                recommendation: 'consultation_required',
                message: `No automated recommendations available for ${input.healthVertical}. A consultation is required.`,
                canPurchase: false,
                redirectPath: '/consultation-required'
            }
        }

        try {
            // Validate responses first
            if (!algorithm.validateResponses(input.responses, input.questions)) {
                return {
                    recommendation: 'incomplete_responses',
                    message: 'Please complete all required questions before receiving recommendations.',
                    canPurchase: false
                }
            }

            // Process recommendations
            return algorithm.processRecommendations(input)

        } catch (error) {
            console.error(`❌ Error processing recommendations for ${input.healthVertical}:`, error)
            return {
                recommendation: 'error',
                message: 'An error occurred while processing your responses. Please try again or contact support.',
                canPurchase: false
            }
        }
    }

    /**
     * Get all registered health verticals
     */
    getRegisteredVerticals(): string[] {
        return Array.from(this.algorithms.keys())
    }

    /**
     * Check if a health vertical has a registered algorithm
     */
    hasAlgorithm(healthVertical: string): boolean {
        return this.algorithms.has(healthVertical)
    }
}

// Export singleton instance
export const algorithmRegistry = new AlgorithmRegistry()

/**
 * Helper function to get recommendations for a health vertical
 */
export function getRecommendations(
    healthVertical: string,
    responses: Record<string, any>,
    questions: any[]
): BaseRecommendationResult {
    console.log('🔬 getRecommendations called with:', { 
        healthVertical, 
        responseCount: Object.keys(responses).length, 
        questionCount: questions.length 
    })
    
    const result = algorithmRegistry.processRecommendations({
        healthVertical,
        responses,
        questions
    })
    
    console.log('🔬 getRecommendations result:', result)
    return result
}

/**
 * Helper function to validate if responses are complete
 */
export function validateResponses(
    healthVertical: string,
    responses: Record<string, any>,
    questions: any[]
): boolean {
    const algorithm = algorithmRegistry.getAlgorithm(healthVertical)
    if (!algorithm) return false
    
    return algorithm.validateResponses(responses, questions)
}