import { createClient } from '@/lib/supabase/server'
import type { SignupRequest } from './validation'

/**
 * Save questionnaire responses from localStorage during signup
 */
export async function saveQuestionnaireResponses(
  userId: string,
  signupData: SignupRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract questionnaire data from signup request
    // The frontend should include localStorage questionnaire data in the signup request
    if (!signupData.questionnaireData || Object.keys(signupData.questionnaireData).length === 0) {
      // No questionnaire data to save - this is fine
      return { success: true }
    }

    const supabase = await createClient()
    const { healthVertical, responses } = signupData.questionnaireData

    if (!healthVertical || !responses) {
      return { success: true } // No valid questionnaire data
    }

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
      console.error('Questionnaire not found for health vertical:', healthVertical)
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
        console.error('Failed to update user responses:', updateError)
        return { success: false, error: 'Failed to update questionnaire responses' }
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
        console.error('Failed to save user responses:', insertError)
        return { success: false, error: 'Failed to save questionnaire responses' }
      }
    }

    console.log(`Successfully saved ${healthVertical} questionnaire responses for user:`, userId)
    return { success: true }

  } catch (error) {
    console.error('Error saving questionnaire responses:', error)
    return { 
      success: false, 
      error: 'Internal error while saving questionnaire responses' 
    }
  }
}