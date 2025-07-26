'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { QuizState, QuizActions } from './types'
// import { hairLossQuestions } from '@/data/hairlossquestions'
import recommendTreatment from '@/lib/hairloss-recommendations'
import { questionnaireService } from '@/lib/services/questionnaire-service'
import { createClient } from '@/app/utils/supabase/client'
import { useAuth } from './auth-context'
import type { Question } from '@/data/hairlossquestions'

// Initial state
const initialQuizState: QuizState = {
  currentQuestionIndex: 0,
  answers: {},
  questionFlow: [],
  isReviewMode: false,
  isCompleted: false,
  recommendations: null,
  sessionId: '',
  startedAt: null,
  completedAt: null,
  questionnaireId: null,
  responseId: null,
  questions: [], // Add questions array to state
  isLoading: false, // Add loading state
  error: null, // Add error state
}

// Action types
type QuizActionType =
  | { type: 'SET_ANSWER'; questionId: string; value: any }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'GO_TO_QUESTION'; index: number }
  | { type: 'ENTER_REVIEW_MODE' }
  | { type: 'EXIT_REVIEW_MODE' }
  | { type: 'SUBMIT_QUIZ' }
  | { type: 'RESET_QUIZ' }
  | { type: 'LOAD_SAVED_QUIZ'; savedState: Partial<QuizState> }
  | { type: 'UPDATE_QUESTION_FLOW'; flow: string[] }
  | { type: 'SET_SESSION_ID'; sessionId: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_QUESTIONS'; questions: any[]; questionnaireId: string }
  | { type: 'SET_RESPONSE_ID'; responseId: string }

// Reducer
function quizReducer(state: QuizState, action: QuizActionType): QuizState {
  switch (action.type) {
    case 'SET_ANSWER':
      const newAnswers = { ...state.answers, [action.questionId]: action.value }
      return { ...state, answers: newAnswers }

    case 'NEXT_QUESTION':
      // Log current question info before moving to next
      const currentQuestionId = state.questionFlow[state.currentQuestionIndex]
      const currentAnswer = state.answers[currentQuestionId]
      console.log('Moving to next question - Current question ID:', currentQuestionId, 'Value:', currentAnswer)

      if (state.currentQuestionIndex < state.questionFlow.length - 1) {
        const nextQuestionId = state.questionFlow[state.currentQuestionIndex + 1]
        console.log('Next question ID:', nextQuestionId)
        return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 }
      }
      console.log('Entering review mode - all questions completed')
      return { ...state, isReviewMode: true }

    case 'PREVIOUS_QUESTION':
      if (state.isReviewMode) {
        return { ...state, isReviewMode: false, currentQuestionIndex: state.questionFlow.length - 1 }
      }
      if (state.currentQuestionIndex > 0) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 }
      }
      return state

    case 'GO_TO_QUESTION':
      return { ...state, currentQuestionIndex: action.index, isReviewMode: false }

    case 'ENTER_REVIEW_MODE':
      return { ...state, isReviewMode: true }

    case 'EXIT_REVIEW_MODE':
      return { ...state, isReviewMode: false }

    case 'SUBMIT_QUIZ':
      const recommendations = recommendTreatment(state.answers as any)
      return {
        ...state,
        isCompleted: true,
        recommendations,
        completedAt: new Date(),
      }

    case 'RESET_QUIZ':
      return {
        ...initialQuizState,
        sessionId: generateSessionId(),
        startedAt: new Date(),
      }

    case 'LOAD_SAVED_QUIZ':
      return { ...state, ...action.savedState }

    case 'UPDATE_QUESTION_FLOW':
      return { ...state, questionFlow: action.flow }

    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.sessionId, startedAt: new Date() }

    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }

    case 'SET_QUESTIONS':
      return {
        ...state,
        questions: action.questions,
        questionnaireId: action.questionnaireId,
        isLoading: false,
        error: null
      }

    case 'SET_RESPONSE_ID':
      return { ...state, responseId: action.responseId }

    default:
      return state
  }
}

// Helper functions
function generateSessionId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function updateQuestionFlow(answers: Record<string, any>, questions: any[]): string[] {
  const flow: string[] = []
  // console.log('Updating question flow with answers:', answers)
  console.log('Available questions:', questions)
  for (const question of questions) {
    // Check if question should be included based on conditional logic
    console.log('Checking question:', question.id, 'Conditional logic:', question.conditional)
    if (question.conditional) {
      const { questionId, value } = question.conditional
      const answer = answers[questionId]

      console.log('Checking conditional logic for question:', question.id)
      console.log('Depends on question:', questionId, 'Expected value:', value, 'Actual answer:', answer)

      // If the dependent question hasn't been answered yet, skip this question
      if (answer === undefined || answer === null || answer === '') {
        console.log('Dependent question not answered yet, skipping question:', question.id)
        continue
      }

      // For checkbox questions, check if the value is in the array
      if (Array.isArray(answer)) {
        if (!answer.includes(value)) {
          console.log('Checkbox condition not met, skipping question:', question.id)
          continue
        }
        console.log('Checkbox condition met, including question:', question.id)
      } else if (answer !== value) {
        console.log('Single value condition not met, skipping question:', question.id)
        continue
      } else {
        console.log('Single value condition met, including question:', question.id)
      }
    }
    flow.push(question.id)
  }

  console.log('Final question flow:', flow)
  return flow
}

// Simple risk score calculation based on answers
function calculateRiskScore(answers: Record<string, any>): number {
  let score = 0

  // Age factor (higher age = higher risk)
  const age = answers.age || 0
  if (age > 50) score += 3
  else if (age > 40) score += 2
  else if (age > 30) score += 1

  // Hair loss progression
  const progression = answers.hairLossProgression || ''
  if (progression === 'Quickly') score += 3
  else if (progression === 'Moderately') score += 2
  else if (progression === 'Slowly') score += 1

  // Family history
  if (answers.familyHistory === 'Yes') score += 2

  // Medical conditions (higher risk if more conditions)
  const conditions = answers.medicalConditions || []
  if (Array.isArray(conditions)) {
    score += Math.min(conditions.length, 5) // Cap at 5 points
  }

  // Importance level
  const importance = answers.importance || 0
  score += Math.floor(importance / 3) // 0-3 additional points based on importance

  return Math.min(score, 10) // Cap at 10
}

// Context
interface QuizContextType {
  state: QuizState
  actions: QuizActions
}

const QuizContext = createContext<QuizContextType | null>(null)

// Provider
export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState)
  const { state: authState } = useAuth()

  // Load questionnaire from Supabase
  const loadQuestionnaire = async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true })

    try {
      const questionnaire = await questionnaireService.getQuestionnaire('hair-loss')
      if (!questionnaire) {
        throw new Error('Failed to load questionnaire')
      }

      const questions = await questionnaireService.getQuestions(questionnaire.id)
      const uiQuestions = questionnaireService.convertDatabaseQuestionsToUIFormat(questions)
      console.log('Loaded questions:', uiQuestions.map(q => q.conditional))

      dispatch({
        type: 'SET_QUESTIONS',
        questions: uiQuestions,
        questionnaireId: questionnaire.id
      })

      // Initialize question flow with loaded questions
      const initialFlow = updateQuestionFlow({}, uiQuestions)
      dispatch({ type: 'UPDATE_QUESTION_FLOW', flow: initialFlow })

      // Try to load saved responses if user is authenticated
      if (authState.user) {
        const draftResponse = await questionnaireService.getDraftResponse(authState.user.id, questionnaire.id)
        if (draftResponse && draftResponse.id) {
          dispatch({ type: 'SET_RESPONSE_ID', responseId: draftResponse.id })
          dispatch({ type: 'LOAD_SAVED_QUIZ', savedState: { answers: draftResponse.responses } })
        }
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error)
      dispatch({ type: 'SET_ERROR', error: 'Failed to load questionnaire' })
    }
  }

  // Save current state to Supabase
  const saveCurrentState = async () => {
    if (!authState.user || !state.questionnaireId) return

    try {
      const responseId = await questionnaireService.saveDraftResponse(
        authState.user.id,
        state.questionnaireId,
        state.answers
      )

      if (responseId && !state.responseId) {
        dispatch({ type: 'SET_RESPONSE_ID', responseId })
      }
    } catch (error) {
      console.error('Error saving current state:', error)
    }
  }

  // Initialize quiz
  useEffect(() => {
    // Start with fresh session ID
    dispatch({ type: 'SET_SESSION_ID', sessionId: generateSessionId() })

    // Load questionnaire from Supabase
    loadQuestionnaire()
  }, [])

  // Save state when answers change (only if user is authenticated)
  useEffect(() => {
    if (authState.user && Object.keys(state.answers).length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentState()
      }, 1000) // Debounce saves by 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [state.answers, authState.user])

  // Update question flow when answers change
  useEffect(() => {
    if (state.questions.length > 0) {
      const newFlow = updateQuestionFlow(state.answers, state.questions)
      if (JSON.stringify(newFlow) !== JSON.stringify(state.questionFlow)) {
        dispatch({ type: 'UPDATE_QUESTION_FLOW', flow: newFlow })
      }
    }
  }, [state.answers, state.questions])

  // Actions
  const actions: QuizActions = {
    setAnswer: (questionId: string, value: any) => {
      dispatch({ type: 'SET_ANSWER', questionId, value })
    },

    nextQuestion: () => {
      dispatch({ type: 'NEXT_QUESTION' })
    },

    previousQuestion: () => {
      dispatch({ type: 'PREVIOUS_QUESTION' })
    },

    goToQuestion: (index: number) => {
      dispatch({ type: 'GO_TO_QUESTION', index })
    },

    enterReviewMode: () => {
      dispatch({ type: 'ENTER_REVIEW_MODE' })
    },

    exitReviewMode: () => {
      dispatch({ type: 'EXIT_REVIEW_MODE' })
    },

    submitQuiz: async () => {
      if (!authState.user || !state.questionnaireId) {
        console.error('User not authenticated or questionnaire not loaded')
        return
      }

      try {
        // Calculate recommendations
        const recommendations = recommendTreatment(state.answers as any)

        // Calculate a simple risk score based on answers (you can enhance this logic)
        const riskScore = calculateRiskScore(state.answers)

        // Submit final response to Supabase
        const success = await questionnaireService.submitResponse(
          authState.user.id,
          state.questionnaireId,
          state.answers,
          riskScore
        )

        if (success) {
          dispatch({ type: 'SUBMIT_QUIZ' })
        } else {
          throw new Error('Failed to submit quiz')
        }
      } catch (error) {
        console.error('Error submitting quiz:', error)
        dispatch({ type: 'SET_ERROR', error: 'Failed to submit quiz' })
      }
    },

    resetQuiz: () => {
      dispatch({ type: 'RESET_QUIZ' })
      // Reload questionnaire
      loadQuestionnaire()
    },

    loadSavedQuiz: () => {
      // This is now handled automatically when the component loads
      console.log('Saved quiz loading is handled automatically')
    },

    saveCurrentState,

    loadQuestionnaire,
  }

  return (
    <QuizContext.Provider value={{ state, actions }}>
      {children}
    </QuizContext.Provider>
  )
}

// Hook
export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}