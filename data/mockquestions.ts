export interface QuestionOption {
  label: string
  value: string
}

export interface Question {
  id: string
  type: "radio" | "checkbox" | "text" | "scale" | "file"
  prompt: string
  options?: QuestionOption[]
  required: boolean
  next?: string | { [key: string]: string } | null
  attributes?: {
    accept?: string
    multiple?: boolean
    maxFiles?: number
  }
}

export const mockQuestions: Question[] = [
  {
    id: "q1",
    type: "radio",
    prompt: "Do you currently use any hair loss treatments?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
    required: true,
    next: { yes: "q2", no: "q3" },
  },
  {
    id: "q2",
    type: "checkbox",
    prompt: "Which of the following treatments are you using?",
    options: [
      { label: "Minoxidil", value: "minoxidil" },
      { label: "Finasteride", value: "finasteride" },
      { label: "Laser Therapy", value: "laser" },
      { label: "Other", value: "other" },
    ],
    required: false,
    next: "q3",
  },
  {
    id: "q3",
    type: "text",
    prompt: "What is your age?",
    required: true,
    next: "q4",
  },
  {
    id: "q4",
    type: "scale",
    prompt: "On a scale of 1 to 5, how would you rate the severity of your hair loss?",
    options: [
      { label: "1 (Mild)", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "5 (Severe)", value: "5" },
    ],
    required: true,
    next: "q5",
  },
  {
    id: "q5",
    type: "checkbox",
    prompt: "Do you have any known allergies?",
    options: [
      { label: "Pollen", value: "pollen" },
      { label: "Latex", value: "latex" },
      { label: "Medication", value: "medication" },
      { label: "Other", value: "other" },
    ],
    required: false,
    next: { other: "q6", default: "q7" },
  },
  {
    id: "q6",
    type: "text",
    prompt: "Please specify your other allergies.",
    required: false,
    next: "q7",
  },
  {
    id: "q7",
    type: "text",
    prompt: "Enter your postal code:",
    required: true,
    next: "q8",
  },
  {
    id: "q8",
    type: "file",
    prompt: "Please upload 2 photos of your scalp:",
    required: true,
    attributes: {
      accept: "image/*",
      multiple: true,
      maxFiles: 2,
    },
    next: "q9",
  },
  {
    id: "q9",
    type: "radio",
    prompt: "Would you like to upload a profile picture for your account?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
    required: false,
    next: null,
  },
]
