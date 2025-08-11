import { createClient } from '@/lib/supabase/server'
import type { CheckoutRequest } from './validation'

export async function saveQuizResponses(
  userId: string, 
  body: CheckoutRequest, 
  signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) {
    throw new Error('Operation cancelled')
  }

  if (!body.quizResponses || Object.keys(body.quizResponses).length === 0) {
    return
  }

  const supabase = await createClient()
  
  // Get the hair-loss questionnaire ID
  const { data: questionnaire } = await supabase
    .from('questionnaires')
    .select('id')
    .eq('name', 'Hair Loss Assessment Questionnaire')
    .single()

  if (!questionnaire) {
    console.error('Hair Loss Assessment Questionnaire not found')
    return
  }

  // Save quiz responses as-is (including base64 file data for later upload)
  const { error: quizError } = await supabase
    .from('user_responses')
    .insert({
      user_id: userId,
      questionnaire_id: questionnaire.id,
      responses: body.quizResponses, // Keep base64 file data intact
      completed_at: new Date().toISOString()
    })

  if (quizError) {
    console.error('Failed to save quiz responses:', quizError)
    throw new Error('Failed to save quiz responses')
  }
}