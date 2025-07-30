export interface Question {
  id: string
  label: string
  question_type: "text" | "number" | "select" | "checkbox" | "radio" | "file" | "scale"
  question_property: string // e.g. "age", "family_history"
  options?: string[]
  conditional?: { questionId: string; value: string }
}
