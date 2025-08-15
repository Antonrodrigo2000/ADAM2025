/**
 * Client-side utility to collect questionnaire data from localStorage
 * This should be used when submitting signup forms to include questionnaire data
 */

export interface QuestionnaireData {
  healthVertical: string
  responses: Record<string, any>
  sessionId?: string
}

export class QuestionnaireLocalStorageCollector {
  /**
   * Collect all questionnaire data from localStorage
   */
  static collectAllQuestionnaireData(): QuestionnaireData[] {
    if (typeof window === 'undefined') return []

    const collectedData: QuestionnaireData[] = []
    const knownVerticals = ['hair-loss', 'sexual-health']

    // Check for health vertical specific localStorage entries
    for (const vertical of knownVerticals) {
      const data = this.collectQuestionnaireData(vertical)
      if (data) {
        collectedData.push(data)
      }
    }

    // Also check for the old generic localStorage key and convert it
    const legacyData = this.collectLegacyQuestionnaireData()
    if (legacyData) {
      collectedData.push(legacyData)
    }

    return collectedData
  }

  /**
   * Collect questionnaire data for a specific health vertical
   */
  static collectQuestionnaireData(healthVertical: string): QuestionnaireData | null {
    if (typeof window === 'undefined') return null

    try {
      const localStorageKey = `clinical-quiz-state-${healthVertical}`
      const savedData = localStorage.getItem(localStorageKey)
      
      if (!savedData) return null

      const quizState = JSON.parse(savedData)
      
      if (!quizState.answers || Object.keys(quizState.answers).length === 0) {
        return null
      }

      return {
        healthVertical,
        responses: quizState.answers,
        sessionId: quizState.sessionId
      }
    } catch (error) {
      console.error(`Error collecting questionnaire data for ${healthVertical}:`, error)
      return null
    }
  }

  /**
   * Collect legacy questionnaire data from the old generic localStorage key
   */
  static collectLegacyQuestionnaireData(): QuestionnaireData | null {
    if (typeof window === 'undefined') return null

    try {
      const savedData = localStorage.getItem('clinical-quiz-state')
      
      if (!savedData) return null

      const quizState = JSON.parse(savedData)
      
      if (!quizState.answers || Object.keys(quizState.answers).length === 0) {
        return null
      }

      // Default to hair-loss for legacy data
      return {
        healthVertical: 'hair-loss',
        responses: quizState.answers,
        sessionId: quizState.sessionId
      }
    } catch (error) {
      console.error('Error collecting legacy questionnaire data:', error)
      return null
    }
  }

  /**
   * Get the most recent questionnaire data (prioritizing the most recently updated)
   */
  static getMostRecentQuestionnaireData(): QuestionnaireData | null {
    const allData = this.collectAllQuestionnaireData()
    
    if (allData.length === 0) return null
    if (allData.length === 1) return allData[0]

    // If multiple questionnaires exist, return the first one
    // In the future, you could add timestamp comparison logic here
    return allData[0]
  }

  /**
   * Clear questionnaire data after successful signup
   */
  static clearQuestionnaireData(healthVertical?: string): void {
    if (typeof window === 'undefined') return

    if (healthVertical) {
      // Clear specific health vertical
      localStorage.removeItem(`clinical-quiz-state-${healthVertical}`)
    } else {
      // Clear all known questionnaire data
      const knownVerticals = ['hair-loss', 'sexual-health']
      
      for (const vertical of knownVerticals) {
        localStorage.removeItem(`clinical-quiz-state-${vertical}`)
      }
      
      // Also clear legacy data
      localStorage.removeItem('clinical-quiz-state')
    }
  }
}

export default QuestionnaireLocalStorageCollector