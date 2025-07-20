"use client"

import type { Question } from "@/data/mockquestions"

interface ReviewScreenProps {
  questions: Question[]
  answers: Record<string, any>
  onSubmit: () => void
}

export function ReviewScreen({ questions, answers, onSubmit }: ReviewScreenProps) {
  const formatAnswer = (question: Question, answer: any) => {
    if (!answer) return "Not answered"

    switch (question.type) {
      case "radio":
      case "scale":
        const option = question.options?.find((opt) => opt.value === answer)
        return option?.label || answer

      case "checkbox":
        if (Array.isArray(answer) && answer.length > 0) {
          return answer
            .map((val) => {
              const option = question.options?.find((opt) => opt.value === val)
              return option?.label || val
            })
            .join(", ")
        }
        return "None selected"

      case "file":
        if (Array.isArray(answer) && answer.length > 0) {
          return `${answer.length} file(s) uploaded`
        }
        return "No files uploaded"

      case "text":
      default:
        return answer
    }
  }

  const answeredQuestions = questions.filter((q) => answers[q.id] !== undefined)

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-neutral-800 mb-2">Review Your Answers</h2>
        <p className="text-neutral-600">
          Please review your responses before submitting. You can go back to make changes if needed.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {answeredQuestions.map((question) => (
          <div key={question.id} className="border-b border-neutral-100 pb-6 last:border-b-0">
            <h3 className="font-medium text-neutral-800 mb-2">{question.prompt}</h3>
            <p className="text-neutral-600">{formatAnswer(question, answers[question.id])}</p>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="font-semibold text-orange-800 mb-2">Ready to Submit?</h3>
        <p className="text-orange-700 text-sm mb-4">
          By submitting this assessment, you confirm that all information provided is accurate and complete.
        </p>
        <button
          onClick={onSubmit}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200"
        >
          Submit Assessment
        </button>
      </div>
    </div>
  )
}
