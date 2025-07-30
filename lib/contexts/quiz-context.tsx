'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { QuizState, QuizActions } from './types'
import recommendTreatment from '@/lib/hairloss-recommendations'
import { createClient } from '@/app/utils/supabase/client'
import { Question } from '@/data/hairlossquestions'

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
    | { type: 'SUBMIT_QUIZ'; questions: any }
    | { type: 'RESET_QUIZ' }
    | { type: 'LOAD_SAVED_QUIZ'; savedState: Partial<QuizState> }
    | { type: 'UPDATE_QUESTION_FLOW'; flow: string[] }
    | { type: 'SET_SESSION_ID'; sessionId: string }

// Reducer
function quizReducer(state: QuizState & { questions?: Question[] }, action: QuizActionType): QuizState {
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

        case 'SUBMIT_QUIZ': {
            const questions = action.questions

            // Map answers keyed by question.id to question_property for recommendTreatment
            const mapAnswersToProperties = (answers: Record<string, any>, questions: any) => {
                const result: any = {}
                for (const q of questions) {
                    if (q.question_property) {
                        result[q.question_property] = answers[q.id]
                    }
                }
                return result
            }
            // Use the mapped answers for recommendations
            const patientData = mapAnswersToProperties(state.answers, questions)
            const recommendations = recommendTreatment(patientData)
            return {
                ...state,
                isCompleted: true,
                recommendations,
                completedAt: new Date(),
            }
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

function updateQuestionFlow(answers: Record<string, any>, questions: any[]): string[] {
    const flow: string[] = []
    for (const question of questions) {
        if (question.conditional) {
            const { questionId, value } = question.conditional
            const answer = answers[questionId]
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
    questions: any[]
}

const QuizContext = createContext<QuizContextType | null>(null)

// Provider
export function QuizProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(quizReducer, initialQuizState)
    const [questions, setQuestions] = useState<Question[]>([])

    // Fetch questions from Supabase
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('questions')
                    .select(`
                        id,
                        questionnaire_id,
                        question_property,
                        question_text,
                        question_type,
                        options,
                        order_index,
                        is_required,
                        conditional_logic,
                        questionnaires!inner(
                        health_verticals!inner(slug)
                        )
                    `)
                    .eq('questionnaires.health_verticals.slug', 'hair-loss')
                    .order('order_index', { ascending: true })
                if (error) throw error
                setQuestions(
                    (data || []).map((q: any) => ({
                        id: q.id,
                        label: q.question_text,
                        question_type: q.question_type,
                        question_property: q.question_property,
                        options: q.options,
                        conditional: q.conditional_logic,
                    }))
                )
            } catch (err) {
                console.error('Failed to fetch questions:', err)
            }
        }
        fetchQuestions()
    }, [])

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
                dispatch({ type: 'SET_SESSION_ID', sessionId: generateSessionId() })
            }
        } else {
            dispatch({ type: 'SET_SESSION_ID', sessionId: generateSessionId() })
        }
    }, [])

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (state.sessionId) {
            localStorage.setItem('clinical-quiz-state', JSON.stringify(state))
        }
    }, [state])

    // Update question flow when answers or questions change
    useEffect(() => {
        if (questions.length === 0) return
        const newFlow = updateQuestionFlow(state.answers, questions)
        if (JSON.stringify(newFlow) !== JSON.stringify(state.questionFlow)) {
            dispatch({ type: 'UPDATE_QUESTION_FLOW', flow: newFlow })
        }
    }, [state.answers, questions])

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
            dispatch({ type: 'SUBMIT_QUIZ', questions })
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
        <QuizContext.Provider value={{ state, actions, questions }}>
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