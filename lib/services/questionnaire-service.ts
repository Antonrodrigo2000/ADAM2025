import { createClient } from '@/lib/supabase/server'

export interface QuestionnaireSubmission {
  healthVertical: string
  responses: Record<string, any>
  sessionId?: string
}

export class QuestionnaireService {
  static async saveUserResponses(
    userId: string, 
    submission: QuestionnaireSubmission
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient()
      const { healthVertical, responses } = submission

      // Get the questionnaire ID for this health vertical
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select(`
          id,
          health_verticals!inner(slug)
        `)
        .eq('health_verticals.slug', healthVertical)
        .eq('is_active', true)
        .single()

      if (questionnaireError || !questionnaire) {
        return { 
          success: false, 
          error: `Questionnaire not found for health vertical: ${healthVertical}` 
        }
      }

      // Check if user already has a response for this questionnaire
      const { data: existingResponse } = await supabase
        .from('user_responses')
        .select('id')
        .eq('user_id', userId)
        .eq('questionnaire_id', questionnaire.id)
        .single()

      if (existingResponse) {
        // Update existing response
        const { error: updateError } = await supabase
          .from('user_responses')
          .update({
            responses: responses,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingResponse.id)

        if (updateError) {
          return { success: false, error: 'Failed to update user responses' }
        }
      } else {
        // Create new response
        const { error: insertError } = await supabase
          .from('user_responses')
          .insert({
            user_id: userId,
            questionnaire_id: questionnaire.id,
            responses: responses,
            completed_at: new Date().toISOString()
          })

        if (insertError) {
          return { success: false, error: 'Failed to save user responses' }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving user responses:', error)
      return { success: false, error: 'Internal server error' }
    }
  }

  static async saveStoredQuestionnaireResponses(userId: string): Promise<void> {
    try {
      // Check localStorage for stored questionnaire responses
      if (typeof window !== 'undefined') {
        const storedResponses = localStorage.getItem('clinical-quiz-state')
        if (storedResponses) {
          const quizState = JSON.parse(storedResponses)
          if (quizState.answers && Object.keys(quizState.answers).length > 0) {
            // Determine health vertical from current URL or default to hair-loss
            const currentPath = window.location.pathname
            let healthVertical = 'hair-loss'
            if (currentPath.includes('/questionnaire/')) {
              const pathParts = currentPath.split('/')
              const slugIndex = pathParts.indexOf('questionnaire') + 1
              if (slugIndex < pathParts.length) {
                healthVertical = pathParts[slugIndex]
              }
            }

            const submission: QuestionnaireSubmission = {
              healthVertical,
              responses: quizState.answers,
              sessionId: quizState.sessionId
            }

            const result = await this.saveUserResponses(userId, submission)
            if (result.success) {
              // Clear stored responses after successful save
              localStorage.removeItem('clinical-quiz-state')
              console.log('Stored questionnaire responses saved successfully')
            } else {
              console.error('Failed to save stored responses:', result.error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error saving stored questionnaire responses:', error)
    }
  }
}

export default QuestionnaireService