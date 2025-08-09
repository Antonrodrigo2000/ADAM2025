'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { QuizState, QuizActions } from './types'
import recommendTreatment from '@/lib/algorithm/hairloss-recommendations'
import { Question } from '@/data/types/question'
import { createClient } from '../lib/supabase/client'
import imageStorage from '@/lib/storage/image-storage'

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
    | { type: 'SET_PROCESSED_ANSWER'; questionId: string; value: any }
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
            // This action stores the raw answer immediately for UI responsiveness
            const newAnswers = { ...state.answers, [action.questionId]: action.value }
            return { ...state, answers: newAnswers }

        case 'SET_PROCESSED_ANSWER':
            // This action stores the processed answer (with image references)
            const processedAnswers = { ...state.answers, [action.questionId]: action.value }
            return { ...state, answers: processedAnswers }

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

function isImageData(value: any): boolean {
    // Check if it's a base64 image string
    if (typeof value === 'string' && value.startsWith('data:image/')) {
        return true
    }
    // Check if it's a File object with image type
    if (value instanceof File && value.type.startsWith('image/')) {
        return true
    }
    // Check if it's a file object from QuestionCard (structure: {name, size, type, data})
    if (value && typeof value === 'object' && 
        value.name && value.size && value.type && value.data &&
        typeof value.type === 'string' && value.type.startsWith('image/') &&
        typeof value.data === 'string' && value.data.startsWith('data:image/')) {
        return true
    }
    // Check if it's an array containing images
    if (Array.isArray(value)) {
        return value.some(item => isImageData(item))
    }
    return false
}

async function processAnswerValue(
    sessionId: string,
    questionId: string,
    value: any
): Promise<any> {
    if (!isImageData(value)) {
        return value
    }

    console.log('processAnswerValue - processing:', value)

    try {
        // Handle single image
        if (typeof value === 'string' && value.startsWith('data:image/')) {
            console.log('Processing base64 string')
            const imageId = await imageStorage.storeImage(sessionId, questionId, value)
            return { type: 'image_reference', imageId }
        } else if (value instanceof File && value.type.startsWith('image/')) {
            console.log('Processing File object')
            const imageId = await imageStorage.storeImage(sessionId, questionId, value)
            return { type: 'image_reference', imageId }
        } else if (value && typeof value === 'object' && 
                   value.name && value.size && value.type && value.data &&
                   typeof value.type === 'string' && value.type.startsWith('image/') &&
                   typeof value.data === 'string' && value.data.startsWith('data:image/')) {
            console.log('Processing QuestionCard file object with metadata:', { name: value.name, size: value.size, type: value.type })
            // Handle file object from QuestionCard - store the base64 data
            const imageId = await imageStorage.storeImage(sessionId, questionId, value.data)
            const result = { type: 'image_reference', imageId, metadata: { name: value.name, size: value.size, fileType: value.type } }
            console.log('Created image reference with metadata:', result)
            return result
        }

        // Handle array of images
        if (Array.isArray(value)) {
            console.log('Processing array of files')
            const processedItems = await Promise.all(
                value.map(async (item, index) => {
                    if (isImageData(item)) {
                        // Check if it's a QuestionCard file object
                        if (item && typeof item === 'object' && 
                            item.name && item.size && item.type && item.data &&
                            typeof item.type === 'string' && item.type.startsWith('image/') &&
                            typeof item.data === 'string' && item.data.startsWith('data:image/')) {
                            console.log('Processing array item - QuestionCard file object:', { name: item.name, size: item.size, type: item.type })
                            const imageId = await imageStorage.storeImage(sessionId, `${questionId}_${index}`, item.data)
                            const result = { type: 'image_reference', imageId, metadata: { name: item.name, size: item.size, fileType: item.type } }
                            console.log('Created array item image reference with metadata:', result)
                            return result
                        } else {
                            // Handle other image types (base64 strings, File objects)
                            const imageId = await imageStorage.storeImage(sessionId, `${questionId}_${index}`, item)
                            return { type: 'image_reference', imageId }
                        }
                    }
                    return item
                })
            )
            return processedItems
        }

        return value
    } catch (error) {
        console.error('Failed to store image:', error)
        // Fallback to original value if storage fails
        return value
    }
}

function createSafeStateForStorage(state: QuizState): QuizState {
    // Create a copy of the state with potentially dangerous values filtered out
    const safeAnswers: Record<string, any> = {}
    
    for (const [questionId, answer] of Object.entries(state.answers)) {
        safeAnswers[questionId] = filterLargeValues(answer)
    }
    
    return {
        ...state,
        answers: safeAnswers
    }
}

function filterLargeValues(value: any): any {
    // If it's already an image reference, keep it
    if (value?.type === 'image_reference') {
        return value
    }
    
    // If it's a base64 image, replace with placeholder
    if (typeof value === 'string' && value.startsWith('data:image/')) {
        return { type: 'temp_image', size: value.length }
    }
    
    // If it's a File object, replace with placeholder
    if (value instanceof File && value.type.startsWith('image/')) {
        return { type: 'temp_file', name: value.name, size: value.size }
    }
    
    // If it's a file object from QuestionCard, replace with placeholder
    if (value && typeof value === 'object' && 
        value.name && value.size && value.type && value.data &&
        typeof value.type === 'string' && value.type.startsWith('image/') &&
        typeof value.data === 'string' && value.data.startsWith('data:image/')) {
        return { type: 'temp_file', name: value.name, size: value.size, originalType: value.type }
    }
    
    // If it's an array, filter each item
    if (Array.isArray(value)) {
        return value.map(filterLargeValues)
    }
    
    // If it's an object, filter its properties
    if (value && typeof value === 'object') {
        const filtered: any = {}
        for (const [key, val] of Object.entries(value)) {
            filtered[key] = filterLargeValues(val)
        }
        return filtered
    }
    
    return value
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
    getImage: (imageId: string) => Promise<string | File | null>
    getAnswerWithImages: (questionId: string) => Promise<any>
}

const QuizContext = createContext<QuizContextType | null>(null)

// Provider
export function QuizProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(quizReducer, initialQuizState)
    const [questions, setQuestions] = useState<Question[]>([])

    // Initialize image storage and fetch questions from Supabase
    useEffect(() => {
        const initializeServices = async () => {
            // Initialize image storage
            try {
                await imageStorage.init()
                // Clean up old images (older than 24 hours)
                await imageStorage.cleanupOldImages()
            } catch (error) {
                console.error('Failed to initialize image storage:', error)
            }
        }
        
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
        
        initializeServices()
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

    // Save to localStorage whenever state changes (excluding raw images)
    useEffect(() => {
        if (state.sessionId) {
            // Create a version of state safe for localStorage (without raw images)
            const safeState = createSafeStateForStorage(state)
            try {
                localStorage.setItem('clinical-quiz-state', JSON.stringify(safeState))
            } catch (error) {
                console.error('Failed to save quiz state to localStorage:', error)
                // If it still fails, try saving without answers entirely
                try {
                    const minimalState = { ...safeState, answers: {} }
                    localStorage.setItem('clinical-quiz-state', JSON.stringify(minimalState))
                } catch (fallbackError) {
                    console.error('Failed to save even minimal quiz state:', fallbackError)
                }
            }
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
            // If the value contains images, process them immediately in the background
            // and store a safe placeholder in the meantime
            if (isImageData(value)) {
                // Store a safe placeholder immediately
                const safePlaceholder = filterLargeValues(value)
                dispatch({ type: 'SET_ANSWER', questionId, value: safePlaceholder })
                
                // Process images in background
                processAnswerValue(state.sessionId, questionId, value)
                    .then((processedValue) => {
                        dispatch({ type: 'SET_PROCESSED_ANSWER', questionId, value: processedValue })
                    })
                    .catch((error) => {
                        console.error('Error processing answer:', error)
                        // Keep the safe placeholder if processing fails
                    })
            } else {
                // For non-image values, store directly
                dispatch({ type: 'SET_ANSWER', questionId, value })
            }
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
            dispatch({ type: 'SUBMIT_QUIZ', questions })
            localStorage.removeItem('clinical-quiz-state')
            // Clean up images after submission
            try {
                await imageStorage.deleteImagesBySession(state.sessionId)
            } catch (error) {
                console.error('Failed to cleanup images after quiz submission:', error)
            }
        },
        resetQuiz: async () => {
            const oldSessionId = state.sessionId
            dispatch({ type: 'RESET_QUIZ' })
            localStorage.removeItem('clinical-quiz-state')
            // Clean up images from the old session
            try {
                await imageStorage.deleteImagesBySession(oldSessionId)
            } catch (error) {
                console.error('Failed to cleanup images after quiz reset:', error)
            }
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

    // Image retrieval functions
    const getImage = async (imageId: string): Promise<string | File | null> => {
        try {
            return await imageStorage.getImage(imageId)
        } catch (error) {
            console.error('Failed to retrieve image:', error)
            return null
        }
    }

    const getAnswerWithImages = async (questionId: string): Promise<any> => {
        const answer = state.answers[questionId]
        if (!answer) return answer

        try {
            // Handle single image reference
            if (answer?.type === 'image_reference') {
                return await imageStorage.getImage(answer.imageId)
            }

            // Handle placeholders - return null to indicate images are still processing
            if (answer?.type === 'temp_image' || answer?.type === 'temp_file') {
                return null // or return a loading indicator
            }

            // Handle array of answers with potential image references and placeholders
            if (Array.isArray(answer)) {
                const resolvedItems = await Promise.all(
                    answer.map(async (item) => {
                        if (item?.type === 'image_reference') {
                            return await imageStorage.getImage(item.imageId)
                        }
                        if (item?.type === 'temp_image' || item?.type === 'temp_file') {
                            return null // Still processing
                        }
                        return item
                    })
                )
                return resolvedItems
            }

            return answer
        } catch (error) {
            console.error('Failed to retrieve images for answer:', error)
            return answer // Return original answer if retrieval fails
        }
    }

    return (
        <QuizContext.Provider value={{ state, actions, questions, getImage, getAnswerWithImages }}>
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