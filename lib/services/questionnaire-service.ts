import { createClient } from '@/app/utils/supabase/client'
import { Question } from '@/data/hairlossquestions'

export interface DatabaseQuestion {
    id: string
    questionnaire_id: string
    question_text: string
    question_type: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file'
    options: string[] | null
    validation_rules: any
    order_index: number
    is_required: boolean
    conditional_logic: any
    created_at: string
}

export interface DatabaseQuestionnaire {
    id: string
    health_vertical_id: string
    version: number
    name: string
    description: string
    is_active: boolean
    created_at: string
}

export interface UserResponse {
    id?: string
    user_id: string
    questionnaire_id: string
    responses: Record<string, any>
    risk_score?: number
    completed_at?: string
    ip_address?: string
    user_agent?: string
}

export class QuestionnaireService {
    private supabase = createClient()

    /**
     * Get the active questionnaire for a health vertical
     */
    async getQuestionnaire(healthVerticalSlug: string = 'hair-loss'): Promise<DatabaseQuestionnaire | null> {
        const { data: healthVertical, error: hvError } = await this.supabase
            .from('health_verticals')
            .select('id')
            .eq('slug', healthVerticalSlug)
            .eq('is_active', true)
            .single()

        if (hvError || !healthVertical) {
            console.error('Error fetching health vertical:', hvError)
            return null
        }

        const { data, error } = await this.supabase
            .from('questionnaires')
            .select('*')
            .eq('health_vertical_id', healthVertical.id)
            .eq('is_active', true)
            .order('version', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            console.error('Error fetching questionnaire:', error)
            return null
        }

        return data
    }

    /**
     * Get all questions for a questionnaire
     */
    async getQuestions(questionnaireId: string): Promise<DatabaseQuestion[]> {
        const { data, error } = await this.supabase
            .from('questions')
            .select('*')
            .eq('questionnaire_id', questionnaireId)
            .order('order_index', { ascending: true })

        if (error) {
            console.error('Error fetching questions:', error)
            return []
        }

        return data || []
    }

    /**
     * Convert database questions to the format expected by the current UI
     */
    convertDatabaseQuestionsToUIFormat(dbQuestions: DatabaseQuestion[]): Question[] {
        return dbQuestions.map(dbQ => {
            // Map database question types to UI types
            let uiType: Question['question_type']
            switch (dbQ.question_type) {
                case 'single_choice':
                    uiType = 'radio'
                    break
                case 'multiple_choice':
                    uiType = 'checkbox'
                    break
                case 'text':
                    uiType = 'text'
                    break
                case 'number':
                    uiType = 'number'
                    break
                case 'date':
                    uiType = 'text' // Handle as text for now
                    break
                case 'select':
                    uiType = 'select'
                    break
                case 'checkbox':
                    uiType = 'checkbox'
                    break
                case 'radio':
                    uiType = 'radio'
                    break
                case 'file':
                    uiType = 'file'
                    break
                default:
                    uiType = 'text'
            }

            const question: Question = {
                id: dbQ.id,
                label: dbQ.question_text,
                question_type: uiType,
                options: dbQ.options || undefined
            }

            console.log("raw conditional logic:", dbQ.conditional_logic)

            // Handle conditional logic
            if (dbQ.conditional_logic) {
                console.log('Found conditional logic for question:', dbQ.conditional_logic)
                question.conditional = dbQ.conditional_logic as any
                console.log('Converted conditional logic:', question.conditional)
            }

            return question
        })
    }

    /**
     * Save user response (draft - not completed)
     */
    async saveDraftResponse(userId: string, questionnaireId: string, responses: Record<string, any>): Promise<string | null> {
        // Check if there's already a draft response for this user and questionnaire
        const { data: existingResponse, error: fetchError } = await this.supabase
            .from('user_responses')
            .select('id')
            .eq('user_id', userId)
            .eq('questionnaire_id', questionnaireId)
            .is('completed_at', null)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking existing response:', fetchError)
            return null
        }

        const responseData = {
            user_id: userId,
            questionnaire_id: questionnaireId,
            responses,
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent
        }

        if (existingResponse) {
            // Update existing draft
            const { data, error } = await this.supabase
                .from('user_responses')
                .update(responseData)
                .eq('id', existingResponse.id)
                .select()
                .single()

            if (error) {
                console.error('Error updating draft response:', error)
                return null
            }

            return data.id
        } else {
            // Create new draft
            const { data, error } = await this.supabase
                .from('user_responses')
                .insert(responseData)
                .select()
                .single()

            if (error) {
                console.error('Error creating draft response:', error)
                return null
            }

            return data.id
        }
    }

    /**
     * Complete and submit the user response
     */
    async submitResponse(userId: string, questionnaireId: string, responses: Record<string, any>, riskScore?: number): Promise<boolean> {
        const responseData = {
            user_id: userId,
            questionnaire_id: questionnaireId,
            responses,
            risk_score: riskScore,
            completed_at: new Date().toISOString(),
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent
        }

        // Check if there's already a draft response
        const { data: existingResponse, error: fetchError } = await this.supabase
            .from('user_responses')
            .select('id')
            .eq('user_id', userId)
            .eq('questionnaire_id', questionnaireId)
            .is('completed_at', null)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking existing response:', fetchError)
            return false
        }

        if (existingResponse) {
            // Update existing draft to completed
            const { error } = await this.supabase
                .from('user_responses')
                .update(responseData)
                .eq('id', existingResponse.id)

            if (error) {
                console.error('Error completing response:', error)
                return false
            }
        } else {
            // Create new completed response
            const { error } = await this.supabase
                .from('user_responses')
                .insert(responseData)

            if (error) {
                console.error('Error submitting response:', error)
                return false
            }
        }

        return true
    }

    /**
     * Get user's draft response for a questionnaire
     */
    async getDraftResponse(userId: string, questionnaireId: string): Promise<UserResponse | null> {
        const { data, error } = await this.supabase
            .from('user_responses')
            .select('*')
            .eq('user_id', userId)
            .eq('questionnaire_id', questionnaireId)
            .is('completed_at', null)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching draft response:', error)
            return null
        }

        return data
    }

    /**
     * Get user's completed responses for a questionnaire
     */
    async getCompletedResponses(userId: string, questionnaireId?: string): Promise<UserResponse[]> {
        let query = this.supabase
            .from('user_responses')
            .select('*')
            .eq('user_id', userId)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: false })

        if (questionnaireId) {
            query = query.eq('questionnaire_id', questionnaireId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching completed responses:', error)
            return []
        }

        return data || []
    }

    /**
     * Helper to get client IP (for audit purposes)
     */
    private async getClientIP(): Promise<string | null> {
        try {
            // In a real application, you might get this from a serverless function
            // For now, we'll just return null and let the database handle it
            return null
        } catch {
            return null
        }
    }
}

export const questionnaireService = new QuestionnaireService()
