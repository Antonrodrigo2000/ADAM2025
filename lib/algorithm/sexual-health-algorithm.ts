import type { HealthVerticalAlgorithm, AlgorithmInput, BaseRecommendationResult } from './types'

export interface SexualHealthPatientData {
    ageRange: string
    primarySexualHealthConcern: string
    erectionAchievementFrequency?: string
    erectionMaintenanceFrequency?: string
    morningErectionsFrequency?: string
    intercoursesDurationBeforeEjaculation?: string
    ejaculationControlLevel?: string
    prematureEjaculationDistressLevel?: string
    takesHeartMedications: string
    takesChestPainMedications: string
    chestPainDuringSexOrAfterSex: string
    existingMedicalConditionsList: string[]
    currentlyTakingRegularMedications: string
    regularMedicationsDetails?: string
    previousErectionTreatmentsExperience: string
    smokingStatus: string
    weeklyAlcoholConsumptionRange: string
    currentStressLevel: string
    importanceOfResolvingSexualIssues: string
    currentRelationshipStatus: string
    expectedTreatmentOutcomesList: string[]
}

export interface SexualHealthRecommendationResult {
    recommendation: string
    message: string
    condition?: 'erectile-dysfunction' | 'premature-ejaculation' | 'both' | 'consultation'
    canPurchase: boolean
    redirectPath?: string
    safetyFlags?: string[]
}

/**
 * Sexual Health Algorithm Implementation
 */
export class SexualHealthAlgorithm implements HealthVerticalAlgorithm {
    healthVertical = 'sexual-health'

    processRecommendations(input: AlgorithmInput): BaseRecommendationResult {
        // Map responses to patient data format
        const patientData = this.mapResponsesToPatientData(input.responses, input.questions)
        
        // Use sexual health algorithm
        const result = this.recommendTreatment(patientData)
        
        // Convert to standard format
        return this.convertToBaseResult(result)
    }

    validateResponses(responses: Record<string, any>, questions: any[]): boolean {
        // Check for required fields for sexual health algorithm
        const requiredFields = ['ageRange', 'primarySexualHealthConcern', 'takesHeartMedications', 'takesChestPainMedications']
        
        for (const field of requiredFields) {
            // Find question by property
            const question = questions.find(q => q.question_property === field)
            if (question && !responses[question.id]) {
                return false
            }
        }
        
        return true
    }

    mapResponsesToPatientData(responses: Record<string, any>, questions: any[]): SexualHealthPatientData {
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

        // Convert to SexualHealthPatientData format with defaults
        return {
            ageRange: mappedData.ageRange || '26-35 years',
            primarySexualHealthConcern: mappedData.primarySexualHealthConcern || '',
            erectionAchievementFrequency: mappedData.erectionAchievementFrequency,
            erectionMaintenanceFrequency: mappedData.erectionMaintenanceFrequency,
            morningErectionsFrequency: mappedData.morningErectionsFrequency,
            intercoursesDurationBeforeEjaculation: mappedData.intercoursesDurationBeforeEjaculation,
            ejaculationControlLevel: mappedData.ejaculationControlLevel,
            prematureEjaculationDistressLevel: mappedData.prematureEjaculationDistressLevel,
            takesHeartMedications: mappedData.takesHeartMedications || 'No',
            takesChestPainMedications: mappedData.takesChestPainMedications || 'No',
            chestPainDuringSexOrAfterSex: mappedData.chestPainDuringSexOrAfterSex || 'No, never',
            existingMedicalConditionsList: Array.isArray(mappedData.existingMedicalConditionsList) ? mappedData.existingMedicalConditionsList : [],
            currentlyTakingRegularMedications: mappedData.currentlyTakingRegularMedications || 'No medicines',
            regularMedicationsDetails: mappedData.regularMedicationsDetails,
            previousErectionTreatmentsExperience: mappedData.previousErectionTreatmentsExperience || 'No, never tried',
            smokingStatus: mappedData.smokingStatus || 'No, never smoked',
            weeklyAlcoholConsumptionRange: mappedData.weeklyAlcoholConsumptionRange || 'None',
            currentStressLevel: mappedData.currentStressLevel || 'Some stress',
            importanceOfResolvingSexualIssues: mappedData.importanceOfResolvingSexualIssues || 'Quite important',
            currentRelationshipStatus: mappedData.currentRelationshipStatus || 'Prefer not to say',
            expectedTreatmentOutcomesList: Array.isArray(mappedData.expectedTreatmentOutcomesList) ? mappedData.expectedTreatmentOutcomesList : []
        }
    }

    private recommendTreatment(patientData: SexualHealthPatientData): SexualHealthRecommendationResult {
        // Check for safety red flags first
        const safetyFlags = this.checkSafetyFlags(patientData)
        if (safetyFlags.length > 0) {
            return {
                recommendation: 'consultation_required',
                message: 'Safety concerns identified that require medical consultation before treatment.',
                condition: 'consultation',
                canPurchase: false,
                safetyFlags
            }
        }

        // Detect conditions based on primary concern and symptoms
        const hasEDConcern = this.hasErectileDysfunctionConcern(patientData)
        const hasPEConcern = this.hasPrematureEjaculationConcern(patientData)
        const hasEDSymptoms = this.detectErectileDysfunctionSymptoms(patientData)
        const hasPESymptoms = this.detectPrematureEjaculationSymptoms(patientData)

        console.log('🔍 Sexual Health Analysis:', {
            hasEDConcern,
            hasPEConcern,
            hasEDSymptoms,
            hasPESymptoms,
            primaryConcern: patientData.primarySexualHealthConcern
        })

        // Determine condition and recommendation
        // Handle "Both problems above" case first - prioritize ED
        if (patientData.primarySexualHealthConcern === 'Both problems above') {
            return {
                recommendation: 'erectile_dysfunction_treatment',
                message: 'Based on your responses indicating both concerns, you may benefit from erectile dysfunction treatments. Multiple concerns identified.',
                condition: 'both',
                canPurchase: true,
                redirectPath: '/products?category=erectile-dysfunction&recommended=true&from=quiz'
            }
        }
        
        // Handle specific ED concern with symptoms
        if (hasEDConcern && hasEDSymptoms) {
            return {
                recommendation: 'erectile_dysfunction_treatment',
                message: 'Based on your responses, you may benefit from erectile dysfunction treatments.',
                condition: 'erectile-dysfunction',
                canPurchase: true,
                redirectPath: '/products?category=erectile-dysfunction&recommended=true&from=quiz'
            }
        }
        
        // Handle specific PE concern with symptoms
        if (hasPEConcern && hasPESymptoms) {
            return {
                recommendation: 'premature_ejaculation_treatment',
                message: 'Based on your responses, you may benefit from premature ejaculation treatments.',
                condition: 'premature-ejaculation',
                canPurchase: true,
                redirectPath: '/products?category=premature-ejaculation&recommended=true&from=quiz'
            }
        }
        
        // Handle ED concern without detailed symptoms (due to conditional logic)
        if (hasEDConcern) {
            return {
                recommendation: 'erectile_dysfunction_treatment',
                message: 'Based on your primary concern, you may benefit from erectile dysfunction treatments.',
                condition: 'erectile-dysfunction',
                canPurchase: true,
                redirectPath: '/products?category=erectile-dysfunction&recommended=true&from=quiz'
            }
        }
        
        // Handle PE concern without detailed symptoms (due to conditional logic)
        if (hasPEConcern) {
            return {
                recommendation: 'premature_ejaculation_treatment',
                message: 'Based on your primary concern, you may benefit from premature ejaculation treatments.',
                condition: 'premature-ejaculation',
                canPurchase: true,
                redirectPath: '/products?category=premature-ejaculation&recommended=true&from=quiz'
            }
        }
        
        // No clear condition - consultation required
        return {
            recommendation: 'consultation_required',
            message: 'Based on your responses, a consultation would be most appropriate to address your concerns.',
            condition: 'consultation',
            canPurchase: false
        }
    }

    private checkSafetyFlags(patientData: SexualHealthPatientData): string[] {
        const flags: string[] = []

        // Absolute contraindications
        if (patientData.takesChestPainMedications === 'Yes') {
            flags.push('chest_pain_medications')
        }

        if (patientData.chestPainDuringSexOrAfterSex === 'Yes, recently (last 6 months)') {
            flags.push('recent_chest_pain_during_sex')
        }

        // Check for severe heart conditions
        if (patientData.existingMedicalConditionsList.includes('Heart disease')) {
            flags.push('heart_disease')
        }

        // High-risk combinations
        if (patientData.takesHeartMedications === 'Yes' && patientData.existingMedicalConditionsList.includes('High blood pressure')) {
            flags.push('complex_cardiovascular')
        }

        return flags
    }

    private hasErectileDysfunctionConcern(patientData: SexualHealthPatientData): boolean {
        return patientData.primarySexualHealthConcern === 'Problems getting or keeping an erection (hard penis)' ||
               patientData.primarySexualHealthConcern === 'Both problems above'
    }

    private hasPrematureEjaculationConcern(patientData: SexualHealthPatientData): boolean {
        return patientData.primarySexualHealthConcern === 'Coming too quickly during sex' ||
               patientData.primarySexualHealthConcern === 'Both problems above'
    }

    private detectErectileDysfunctionSymptoms(patientData: SexualHealthPatientData): boolean {
        let edScore = 0

        // Difficulty achieving erection (weight: 3)
        if (patientData.erectionAchievementFrequency === 'Most of the time' || 
            patientData.erectionAchievementFrequency === 'Almost always') {
            edScore += 3
        } else if (patientData.erectionAchievementFrequency === 'Sometimes (about half the time)') {
            edScore += 2
        }

        // Difficulty maintaining erection (weight: 3)
        if (patientData.erectionMaintenanceFrequency === 'Almost never' || 
            patientData.erectionMaintenanceFrequency === 'Sometimes') {
            edScore += 3
        } else if (patientData.erectionMaintenanceFrequency === 'Most of the time') {
            edScore += 1
        }

        // Morning erections (weight: 2)
        if (patientData.morningErectionsFrequency === 'Never' || 
            patientData.morningErectionsFrequency === 'Rarely') {
            edScore += 2
        } else if (patientData.morningErectionsFrequency === 'Yes, sometimes') {
            edScore += 1
        }

        console.log('🔍 ED Score:', edScore, 'for patient with symptoms:', {
            achievement: patientData.erectionAchievementFrequency,
            maintenance: patientData.erectionMaintenanceFrequency,
            morning: patientData.morningErectionsFrequency
        })

        // ED likely if score >= 4 (moderate to severe symptoms)
        return edScore >= 4
    }

    private detectPrematureEjaculationSymptoms(patientData: SexualHealthPatientData): boolean {
        let peScore = 0

        // Duration before ejaculation (weight: 3)
        if (patientData.intercoursesDurationBeforeEjaculation === 'Less than 1 minute') {
            peScore += 3
        } else if (patientData.intercoursesDurationBeforeEjaculation === '1-2 minutes') {
            peScore += 2
        } else if (patientData.intercoursesDurationBeforeEjaculation === '2-5 minutes') {
            peScore += 1
        }

        // Control level (weight: 3)
        if (patientData.ejaculationControlLevel === 'No control') {
            peScore += 3
        } else if (patientData.ejaculationControlLevel === 'Little control') {
            peScore += 2
        } else if (patientData.ejaculationControlLevel === 'Some control') {
            peScore += 1
        }

        // Distress level (weight: 2)
        if (patientData.prematureEjaculationDistressLevel === 'Very bothered') {
            peScore += 2
        } else if (patientData.prematureEjaculationDistressLevel === 'Quite bothered') {
            peScore += 1
        }

        console.log('🔍 PE Score:', peScore, 'for patient with symptoms:', {
            duration: patientData.intercoursesDurationBeforeEjaculation,
            control: patientData.ejaculationControlLevel,
            distress: patientData.prematureEjaculationDistressLevel
        })

        // PE likely if score >= 4 (moderate to severe symptoms)
        return peScore >= 4
    }

    private convertToBaseResult(result: SexualHealthRecommendationResult): BaseRecommendationResult {
        return {
            recommendation: result.recommendation,
            message: result.message,
            canPurchase: result.canPurchase,
            productSlug: undefined, // No specific product, redirect to products page with category
            redirectPath: result.redirectPath
        }
    }
}

// Export instance for registration
export const sexualHealthAlgorithm = new SexualHealthAlgorithm()