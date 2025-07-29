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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
      {" "}
      {/* Reduced p-8 to p-6, rounded-2xl to rounded-xl */}
      <div className="mb-6">
        {" "}
        {/* Reduced mb-8 to mb-6 */}
        <h2 className="text-2xl font-semibold text-neutral-800 mb-1.5">Review Your Answers</h2>{" "}
        {/* Reduced text-3xl to text-2xl, mb-2 to mb-1.5 */}
        <p className="text-neutral-600 text-sm">
          {" "}
          {/* Reduced text-base to text-sm */}
          Please review your responses before submitting. You can go back to make changes if needed.
        </p>
      </div>
      <div className="space-y-4 mb-6">
        {" "}
        {/* Reduced space-y-6 to space-y-4, mb-8 to mb-6 */}
        {answeredQuestions.map((question) => (
          <div key={question.id} className="border-b border-neutral-100 pb-4 last:border-b-0">
            {" "}
            {/* Reduced pb-6 to pb-4 */}
            <h3 className="font-medium text-neutral-800 mb-1.5 text-base">{question.prompt}</h3>{" "}
            {/* Reduced text-lg to text-base, mb-2 to mb-1.5 */}
            <p className="text-neutral-600 text-sm">{formatAnswer(question, answers[question.id])}</p>{" "}
            {/* Reduced text-base to text-sm */}
          </div>
        ))}
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        {" "}
        {/* Reduced p-6 to p-4, rounded-xl to rounded-lg */}
        <h3 className="font-semibold text-orange-800 mb-1.5 text-base">Ready to Submit?</h3>{" "}
        {/* Reduced text-lg to text-base, mb-2 to mb-1.5 */}
        <p className="text-orange-700 text-xs mb-3">
          {" "}
          {/* Reduced text-sm to text-xs, mb-4 to mb-3 */}
          By submitting this assessment, you confirm that all information provided is accurate and complete.
        </p>
        <button
          onClick={onSubmit}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-5 rounded-lg transition-colors duration-200 text-sm" // Reduced py-4 px-6 to py-3 px-5, rounded-xl to rounded-lg, text-base to text-sm
        >
          Submit Assessment
        </button>
      </div>
    </div>
  )
}
