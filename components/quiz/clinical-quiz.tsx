"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { hairLossQuestions } from "@/data/hairlossquestions"
import { ProgressBar } from "./progress-bar"
import { QuestionCard } from "./question-card"
import { ReviewScreen } from "./review-screen"
import { RecommendationsScreen } from "./recommendations-screen"
import type { Question } from "@/data/hairlossquestions"
import recommendTreatment from "@/lib/hairloss-recommendations"
import type { PatientData, RecommendationResult } from "@/lib/hairloss-recommendations"

const STORAGE_KEY = "clinical-quiz-answers"

export function ClinicalQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [isRecommendationsMode, setIsRecommendationsMode] = useState(false)
  const [questionFlow, setQuestionFlow] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)

  // Load saved answers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setAnswers(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load saved answers:", error)
      }
    }

    // Initialize question flow with first question
    setQuestionFlow([hairLossQuestions[0].id])
  }, [])

  // Save answers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  // Update question flow based on conditional logic
  useEffect(() => {
    updateQuestionFlow()
  }, [answers])

  const updateQuestionFlow = () => {
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

    setQuestionFlow(flow)
  }

  const currentQuestion = hairLossQuestions.find((q) => q.id === questionFlow[currentQuestionIndex])
  const totalSteps = questionFlow.length + 1 // +1 for review screen

  const validateQuestion = (question: Question, answer: any): string | null => {
    if (answer === undefined || answer === null || answer === "") {
      return "This field is required."
    }

    if (question.type === "checkbox" && Array.isArray(answer) && answer.length === 0) {
      return "Please select at least one option."
    }

    if (question.type === "file") {
      if (!Array.isArray(answer) || answer.length === 0) {
        return "Please upload the required photos."
      }
    }

    if (question.type === "number" && (isNaN(answer) || answer <= 0)) {
      return "Please enter a valid number."
    }

    return null
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setErrors((prev) => ({ ...prev, [questionId]: "" }))
  }

  const handleNext = () => {
    if (!currentQuestion) return

    const answer = answers[currentQuestion.id]
    const error = validateQuestion(currentQuestion, answer)

    if (error) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }))
      return
    }

    // Clear any existing error
    setErrors((prev) => ({ ...prev, [currentQuestion.id]: "" }))

    // Check if this is the last question
    if (currentQuestionIndex >= questionFlow.length - 1) {
      setIsReviewMode(true)
      return
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1)
  }

  const handleBack = () => {
    if (isRecommendationsMode) {
      setIsRecommendationsMode(false)
      setIsReviewMode(true)
    } else if (isReviewMode) {
      setIsReviewMode(false)
      setCurrentQuestionIndex(questionFlow.length - 1)
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = () => {
    try {
      // Transform answers to match PatientData interface
      const patientData: PatientData = {
        age: answers.age || 0,
        gender: answers.gender || "",
        hairLossAreas: answers.hairLossAreas || [],
        hairLossOnset: answers.hairLossOnset || "",
        hairLossProgression: answers.hairLossProgression || "",
        familyHistory: answers.familyHistory || "",
        familyHistoryAge: answers.familyHistoryAge,
        medicalConditions: answers.medicalConditions || [],
        otherMedicalConditions: answers.otherMedicalConditions,
        medications: answers.medications || "",
        medicationsList: answers.medicationsList,
        previousTreatments: answers.previousTreatments || "",
        previousTreatmentsDetails: answers.previousTreatmentsDetails,
        treatmentGoals: answers.treatmentGoals || [],
        importance: Number(answers.importance) || 1,
        commitment: answers.commitment || "",
        photos: answers.photos || [],
      }

      // Generate recommendations
      const result = recommendTreatment(patientData)
      setRecommendations(result)
      setIsReviewMode(false)
      setIsRecommendationsMode(true)

      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error generating recommendations:", error)
      alert("There was an error processing your assessment. Please try again.")
    }
  }

  const canGoNext = () => {
    if (!currentQuestion) return false

    const answer = answers[currentQuestion.id]
    if (answer === undefined || answer === null || answer === "") return false
    if (currentQuestion.type === "checkbox" && Array.isArray(answer) && answer.length === 0) return false
    if (currentQuestion.type === "file" && (!Array.isArray(answer) || answer.length === 0)) return false
    if (currentQuestion.type === "number" && (isNaN(answer) || answer <= 0)) return false

    return true
  }

  if (isRecommendationsMode && recommendations) {
    return <RecommendationsScreen recommendations={recommendations} patientData={answers} onBack={handleBack} />
  }

  if (isReviewMode) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <ProgressBar currentStep={totalSteps} totalSteps={totalSteps} />

          <ReviewScreen
            questions={hairLossQuestions.filter((q) => questionFlow.includes(q.id))}
            answers={answers}
            onSubmit={handleSubmit}
          />

          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-neutral-600 hover:text-neutral-800 font-medium transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressBar currentStep={currentQuestionIndex + 1} totalSteps={totalSteps} />

        <QuestionCard
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          error={errors[currentQuestion.id]}
        />

        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-6 py-3 text-neutral-600 hover:text-neutral-800 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="flex items-center px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}
