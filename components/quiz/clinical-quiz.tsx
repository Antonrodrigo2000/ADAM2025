"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProgressBar } from "./progress-bar"
import { QuestionCard } from "./question-card"
import { ReviewScreen } from "./review-screen"
import { RecommendationsScreen } from "./recommendations-screen"
import { useQuiz } from "@/contexts"
import type { Question } from "@/data/types/question"

interface ClinicalQuizProps {
    healthVertical?: string
}

export function ClinicalQuiz({ healthVertical = 'hair-loss' }: ClinicalQuizProps) {
    const { state, actions, questions } = useQuiz() // get questions from context
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showDisclaimer, setShowDisclaimer] = useState(true)

    const currentQuestion = (
        questions.length > 0 &&
        state.questionFlow.length > 0 &&
        state.currentQuestionIndex >= 0 &&
        state.currentQuestionIndex < state.questionFlow.length
    )
        ? questions.find((q) => q.id === state.questionFlow[state.currentQuestionIndex])
        : undefined

    const totalSteps = state.questionFlow.length + 2 // +1 for disclaimer, +1 for review screen

    const validateQuestion = (question: Question, answer: any): string | null => {
        if (answer === undefined || answer === null || answer === "") {
            return "This field is required."
        }

        if (question.question_type === "checkbox" && Array.isArray(answer) && answer.length === 0) {
            return "Please select at least one option."
        }

        if (question.question_type === "file") {
            if (!Array.isArray(answer) || answer.length === 0) {
                return "Please upload the required photos."
            }
        }

        if (question.question_type === "number" && (isNaN(answer) || answer <= 0)) {
            return "Please enter a valid number."
        }

        return null
    }

    const handleAnswerChange = (questionId: string, value: any) => {
        // Fire and forget - let setAnswer handle the async processing internally
        actions.setAnswer(questionId, value)
        setErrors((prev) => ({ ...prev, [questionId]: "" }))
    }

    const handleNext = () => {
        if (!currentQuestion) return

        const answer = state.answers[currentQuestion.id]
        const error = validateQuestion(currentQuestion, answer)

        if (error) {
            setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }))
            return
        }

        // Clear any existing error
        setErrors((prev) => ({ ...prev, [currentQuestion.id]: "" }))

        actions.nextQuestion()
    }

    const handleBack = () => {
        if (state.isCompleted) {
            // Go back from recommendations to review
            actions.exitReviewMode()
        } else {
            actions.previousQuestion()
        }
    }

    const handleSubmit = () => {
        try {
            actions.submitQuiz()
        } catch (error) {
            console.error("Error generating recommendations:", error)
            alert("There was an error processing your assessment. Please try again.")
        }
    }

    const canGoNext = () => {
        if (!currentQuestion) return false

        const answer = state.answers[currentQuestion.id]
        if (answer === undefined || answer === null || answer === "") return false
        if (currentQuestion.question_type === "checkbox" && Array.isArray(answer) && answer.length === 0) return false
        if (currentQuestion.question_type === "file" && (!Array.isArray(answer) || answer.length === 0)) return false
        if (currentQuestion.question_type === "number" && (isNaN(answer) || answer <= 0)) return false

        return true
    }

    const DisclaimerScreen = () => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
            {" "}
            {/* Scaled p-8 to p-6, rounded-2xl to rounded-xl */}
            <div className="max-w-xl mx-auto">
                {" "}
                {/* Scaled max-w-2xl to max-w-xl */}
                {/* Header */}
                <div className="text-center mb-6">
                    {" "}
                    {/* Scaled mb-8 to mb-6 */}
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 leading-tight">
                        {" "}
                        {/* Scaled text-3xl to text-2xl, text-4xl to text-3xl, mb-4 to mb-3 */}
                        The really important bit
                    </h1>
                    <p className="text-base text-neutral-700 font-medium">By clicking "Next", you are confirming that you:</p>{" "}
                    {/* Scaled text-lg to text-base */}
                </div>
                {/* Disclaimer List */}
                <div className="space-y-3 mb-6">
                    {" "}
                    {/* Scaled space-y-4 to space-y-3, mb-8 to mb-6 */}
                    <div className="flex items-start space-x-3">
                        {" "}
                        {/* Scaled space-x-4 to space-x-3 */}
                        <div className="flex-shrink-0 mt-0.5">
                            {" "}
                            {/* Scaled mt-1 to mt-0.5 */}
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>{" "}
                            {/* Scaled w-2 h-2 to w-1.5 h-1.5 */}
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">
                            {" "}
                            {/* Scaled text-base to text-sm */}
                            Are completing this consultation for yourself and to the best of your knowledge.
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">Were assigned male at birth.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">
                            Will disclose any serious illnesses or operations you have had or any prescription medication you
                            currently take.
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">
                            Will only use one method of hair loss treatment at a time and will not combine more than one different
                            medication for the condition.
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">
                            Are aware that taking finasteride may cause mood changes. If this happens you should contact your GP
                            immediately.
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">
                            Are aware that you should not take finasteride if you're trying for a baby.
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">
                            Are aware that you may be prescribed an{" "}
                            <span className="text-orange-600 underline">unlicensed treatment</span>.
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-neutral-800 transform rotate-45"></div>
                        </div>
                        <p className="text-neutral-700 leading-relaxed text-sm">
                            Are accepting our <span className="text-orange-600 underline cursor-pointer">Terms & Conditions</span> and{" "}
                            <span className="text-orange-600 underline cursor-pointer">Terms of Sale</span>.
                        </p>
                    </div>
                </div>
                {/* Next Button */}
                <button
                    onClick={() => setShowDisclaimer(false)}
                    className="w-full hover:bg-orange-600 text-white font-bold text-base py-3 px-5 rounded-xl transition-colors duration-200 flex items-center justify-center group bg-black" // Scaled text-lg to text-base, py-4 px-6 to py-3 px-5
                >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />{" "}
                    {/* Scaled w-6 h-6 to w-5 h-5 */}
                </button>
            </div>
        </div>
    )

    // Utility to map answers keyed by question.id to an object keyed by question_property
    function mapAnswersToProperties(answers: Record<string, any>, questions: Question[]) {
        const result: Record<string, any> = {}
        for (const q of questions) {
            if (q.question_property) {
                result[q.question_property] = answers[q.id]
            }
        }
        return result
    }

    if (state.isCompleted && state.recommendations) {
        // Map answers to question_property keys for RecommendationsScreen
        const patientData = mapAnswersToProperties(state.answers, questions)
        return <RecommendationsScreen recommendations={state.recommendations} patientData={patientData} onBack={handleBack} />
    }

    if (state.isReviewMode) {
        return (
            <div className="min-h-screen bg-neutral-50 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <ProgressBar currentStep={totalSteps} totalSteps={totalSteps} />

                    <ReviewScreen
                        questions={questions.filter((q) => state.questionFlow.includes(q.id))}
                        answers={state.answers}
                        onSubmit={handleSubmit}
                        healthVertical={healthVertical}
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

    if (showDisclaimer) {
        return (
            <div className="min-h-screen bg-neutral-50 py-4 px-2">
                {" "}
                {/* Scaled py-8 to py-4, px-4 to px-2 */}
                <div className="max-w-2xl mx-auto">
                    {" "}
                    {/* Scaled max-w-3xl to max-w-2xl */}
                    <DisclaimerScreen />
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
                <ProgressBar currentStep={state.currentQuestionIndex + 2} totalSteps={totalSteps} />

                <QuestionCard
                    question={currentQuestion}
                    value={state.answers[currentQuestion.id]}
                    onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    error={errors[currentQuestion.id]}
                />

                <div className="mt-8 flex justify-between">
                    <button
                        onClick={handleBack}
                        disabled={state.currentQuestionIndex === 0}
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
