import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SubmissionRequest {
  healthVertical: string
  responses: Record<string, any>
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmissionRequest = await request.json()
    const { healthVertical, responses, sessionId } = body

    if (!healthVertical || !responses || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: healthVertical and responses' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // User is not authenticated, store in session storage for later
      return NextResponse.json({
        success: true,
        message: 'Responses stored in session. Will be saved when user signs up.',
        saveToDatabase: false
      })
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
      return NextResponse.json(
        { error: `Questionnaire not found for health vertical: ${healthVertical}` },
        { status: 404 }
      )
    }

    // Check if user already has a response for this questionnaire
    const { data: existingResponse } = await supabase
      .from('user_responses')
      .select('id')
      .eq('user_id', user.id)
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
        return NextResponse.json(
          { error: 'Failed to update user responses' },
          { status: 500 }
        )
      }
    } else {
      // Create new response
      const { error: insertError } = await supabase
        .from('user_responses')
        .insert({
          user_id: user.id,
          questionnaire_id: questionnaire.id,
          responses: responses,
          completed_at: new Date().toISOString()
        })

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to save user responses' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Responses saved successfully',
      saveToDatabase: true
    })

  } catch (error) {
    console.error('Error in questionnaire submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}