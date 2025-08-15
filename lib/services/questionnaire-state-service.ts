import { createClient } from '@/lib/supabase/client'
import type { QuizState } from '@/contexts/types'

export interface QuestionnaireStateManager {
  healthVertical: string
  localStorageKey: string
}

export class QuestionnaireStateService {
  private healthVertical: string
  private localStorageKey: string

  constructor(healthVertical: string) {
    this.healthVertical = healthVertical
    this.localStorageKey = `clinical-quiz-state-${healthVertical}`
  }

  /**
   * Get saved state for this specific health vertical
   */
  getSavedState(): Partial<QuizState> | null {
    if (typeof window === 'undefined') return null
    
    try {
      const savedState = localStorage.getItem(this.localStorageKey)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        // Validate that the saved state is for the correct health vertical
        if (parsed.healthVertical === this.healthVertical) {
          return parsed
        } else {
          // Clear invalid state
          this.clearSavedState()
          return null
        }
      }
    } catch (error) {
      console.error('Failed to load saved quiz state:', error)
      this.clearSavedState()
    }
    return null
  }

  /**
   * Save state for this specific health vertical
   */
  saveState(state: QuizState): void {
    if (typeof window === 'undefined') return
    
    try {
      const stateToSave = {
        ...state,
        healthVertical: this.healthVertical
      }
      localStorage.setItem(this.localStorageKey, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save quiz state:', error)
    }
  }

  /**
   * Clear saved state for this health vertical
   */
  clearSavedState(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.localStorageKey)
  }

  /**
   * Check if user has existing response in database
   */
  async checkExistingUserResponse(): Promise<{
    hasResponse: boolean
    response?: any
  }> {
    try {
      const supabase = createClient()
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { hasResponse: false }
      }

      // Get user's existing response for this health vertical
      const { data: userResponse, error: responseError } = await supabase
        .from('user_responses')
        .select(`
          id,
          responses,
          completed_at,
          questionnaires!inner(
            health_verticals!inner(slug)
          )
        `)
        .eq('user_id', user.id)
        .eq('questionnaires.health_verticals.slug', this.healthVertical)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (responseError || !userResponse) {
        return { hasResponse: false }
      }

      return {
        hasResponse: true,
        response: userResponse
      }
    } catch (error) {
      console.error('Error checking existing user response:', error)
      return { hasResponse: false }
    }
  }


  /**
   * Clean up old localStorage entries from different health verticals
   */
  static cleanupOldStates(): void {
    if (typeof window === 'undefined') return
    
    // Clean up the old generic key
    localStorage.removeItem('clinical-quiz-state')
    
    // List of known health verticals to preserve
    const knownVerticals = ['hair-loss', 'sexual-health']
    
    // Clean up any localStorage keys that don't match known patterns
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith('clinical-quiz-state-') && !knownVerticals.some(v => key === `clinical-quiz-state-${v}`)) {
        localStorage.removeItem(key)
      }
    }
  }
}

export default QuestionnaireStateService