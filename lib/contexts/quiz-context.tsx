'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { QuizState, QuizActions } from './types'
import { hairLossQuestions } from '@/data/hairlossquestions'
import recommendTreatment from '@/lib/hairloss-recommendations'

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

// Reducer
function quizReducer(state: QuizState, action: QuizActionType): QuizState {
  switch (action.type) {
    case 'SET_ANSWER':
      const newAnswers = { ...state.answers, [action.questionId]: action.value }
      return { ...state, answers: newAnswers }

    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.questionFlow.length - 1) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 }
      }
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

    default:
      return state
  }
}

// Helper functions
function generateSessionId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function updateQuestionFlow(answers: Record<string, any>): string[] {
  const flow: string[] = []
  
  for (const question of hairLossQuestions) {
    // Check if question should be included based on conditional logic
    if (question.conditional) {
      const { questionId, value } = question.conditional
      const answer = answers[questionId]

      // For checkbox questions, check if the value is in the array
      if (Array.isArray(answer)) {
        if (!answer.includes(value)) continue
      } else if (answer !== value) {
        continue
      }
    }
    flow.push(question.id)
  }
  
  return flow
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

  // Initialize quiz
  useEffect(() => {
    // Try to load saved quiz from localStorage
    const savedQuiz = localStorage.getItem('clinical-quiz-state')
    if (savedQuiz) {
      try {
        const savedState = JSON.parse(savedQuiz)
        dispatch({ type: 'LOAD_SAVED_QUIZ', savedState })
      } catch (error) {
        console.error('Failed to load saved quiz:', error)
        // Start fresh quiz
        dispatch({ type: 'SET_SESSION_ID', sessionId: generateSessionId() })
      }
    } else {
      // Start fresh quiz
      dispatch({ type: 'SET_SESSION_ID', sessionId: generateSessionId() })
    }

    // Initialize question flow
    const initialFlow = updateQuestionFlow({})
    dispatch({ type: 'UPDATE_QUESTION_FLOW', flow: initialFlow })
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem('clinical-quiz-state', JSON.stringify(state))
    }
  }, [state])

  // Update question flow when answers change
  useEffect(() => {
    const newFlow = updateQuestionFlow(state.answers)
    if (JSON.stringify(newFlow) !== JSON.stringify(state.questionFlow)) {
      dispatch({ type: 'UPDATE_QUESTION_FLOW', flow: newFlow })
    }
  }, [state.answers])

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

    submitQuiz: () => {
      dispatch({ type: 'SUBMIT_QUIZ' })
      // Clear localStorage after successful submission
      localStorage.removeItem('clinical-quiz-state')
    },

    resetQuiz: () => {
      dispatch({ type: 'RESET_QUIZ' })
      localStorage.removeItem('clinical-quiz-state')
    },

    loadSavedQuiz: () => {
      const savedQuiz = localStorage.getItem('clinical-quiz-state')
      if (savedQuiz) {
        try {
          const savedState = JSON.parse(savedQuiz)
          dispatch({ type: 'LOAD_SAVED_QUIZ', savedState })
        } catch (error) {
          console.error('Failed to load saved quiz:', error)
        }
      }
    },
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