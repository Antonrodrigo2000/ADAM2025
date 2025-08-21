import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecommendations } from '@/lib/algorithm'
import { redirect } from 'next/navigation'

interface SubmissionRequest {
  healthVertical: string
  responses: Record<string, any>
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Questionnaire submit API called')
    const body: SubmissionRequest = await request.json()
    const { healthVertical, responses, sessionId } = body
    
    console.log('📝 Request data:', { healthVertical, responseCount: Object.keys(responses || {}).length, sessionId })

    if (!healthVertical || !responses || Object.keys(responses).length === 0) {
      console.error('❌ Missing required fields:', { healthVertical: !!healthVertical, responses: !!responses, responseCount: Object.keys(responses || {}).length })
      return NextResponse.json(
        { error: 'Missing required fields: healthVertical and responses' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔐 Auth check:', { user: !!user, authError: !!authError, userId: user?.id })
    
    let saveToDatabase = false
    
    // Only save to database if user is authenticated
    if (!authError && user) {
      // Get the questionnaire ID for this health vertical
      console.log('📋 Looking up questionnaire for health vertical:', healthVertical)
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select(`
          id,
          health_verticals!inner(slug)
        `)
        .eq('health_verticals.slug', healthVertical)
        .eq('is_active', true)
        .single()

      console.log('📋 Questionnaire lookup result:', { questionnaire: !!questionnaire, error: questionnaireError })

      if (!questionnaireError && questionnaire) {
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

          if (!updateError) {
            saveToDatabase = true
            console.log('✅ Updated existing user response')
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

          if (!insertError) {
            saveToDatabase = true
            console.log('✅ Created new user response')
          }
        }
      }
    } else {
      console.log('⚠️ User not authenticated, skipping database save')
    }

    // Generate recommendations and redirect directly (for both auth and non-auth users)
    try {
      console.log('🎆 Starting recommendation generation for:', healthVertical)
      // Get questions for this health vertical to pass to algorithm
      const { data: questions } = await supabase
        .from('questions')
        .select(`
          id,
          question_property,
          question_text,
          question_type,
          questionnaires!inner(
            health_verticals!inner(slug)
          )
        `)
        .eq('questionnaires.health_verticals.slug', healthVertical)
        .order('order_index', { ascending: true })

      console.log('📋 Questions found:', questions?.length || 0)

      if (questions && questions.length > 0) {
        // Generate recommendations using the dynamic algorithm system
        console.log('🔬 Generating recommendations...')
        const recommendationResult = getRecommendations(healthVertical, responses, questions)
        
        console.log(`🔬 Generated recommendations for ${healthVertical}:`, recommendationResult)
        
        // Direct redirect based on recommendation
        if (recommendationResult.canPurchase && recommendationResult.redirectPath) {
          // Eligible for treatment - redirect to product page
          return NextResponse.json({
            success: true,
            message: 'Eligible for treatment',
            saveToDatabase,
            redirect: recommendationResult.redirectPath,
            recommendations: recommendationResult
          })
        } else {
          // Not eligible - redirect to consultation page
          const consultationPath = `/questionnaire/${healthVertical}/consultation-required`
          return NextResponse.json({
            success: true,
            message: recommendationResult.message,
            saveToDatabase,
            redirect: consultationPath,
            recommendations: recommendationResult
          })
        }
      }
    } catch (recommendationError) {
      console.error('Error generating recommendations:', recommendationError)
      // Fallback to consultation page if there's an error
      return NextResponse.json({
        success: true,
        message: 'Responses processed successfully',
        saveToDatabase,
        redirect: `/questionnaire/${healthVertical}/consultation-required`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Responses processed successfully',
      saveToDatabase
    })

  } catch (error) {
    console.error('Error in questionnaire submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}