import { ClinicalQuiz } from "@/components/quiz/clinical-quiz"
import { QuizProvider } from "@/contexts/quiz-context"
import { notFound } from "next/navigation"

interface QuestionnairePageProps {
  params: {
    slug: string
  }
}

export default function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { slug } = params
  // Validate that the slug is supported
  const supportedVerticals = ['hair-loss', 'sexual-health'] // Add more as needed
  
  if (!supportedVerticals.includes(slug)) {
    notFound()
  }

  return (
    <QuizProvider healthVertical={slug}>
      <ClinicalQuiz healthVertical={slug} />
    </QuizProvider>
  )
}

export async function generateStaticParams() {
  // Generate static params for known health verticals
  return [
    { slug: 'hair-loss' },
    { slug: 'sexual-health' }
  ]
}