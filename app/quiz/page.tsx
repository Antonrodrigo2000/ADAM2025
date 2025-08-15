import { redirect } from 'next/navigation'

export default function QuizPage() {
  // Redirect to the new dynamic questionnaire route
  redirect('/questionnaire/hair-loss')
}
