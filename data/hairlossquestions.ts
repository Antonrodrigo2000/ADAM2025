export interface Question {
  id: string
  label: string
  question_type: "text" | "number" | "select" | "checkbox" | "radio" | "file" | "scale"
  options?: string[]
  conditional?: { questionId: string; value: string }
}

// export const hairLossQuestions: Question[] = [
//   {
//     id: "age",
//     label: "What is your age?",
//     type: "number",
//   },
//   {
//     id: "gender",
//     label: "What is your gender?",
//     type: "select",
//     options: ["Male", "Female"],
//   },
//   {
//     id: "hairLossAreas",
//     label: "Where are you losing hair? (Select all that apply)",
//     type: "checkbox",
//     options: [
//       "Temples (sides of forehead)",
//       "Crown (top back of head)",
//       "Overall thinning (hair getting thinner everywhere)",
//       "Patches of complete hair loss (bald spots)",
//     ],
//   },
//   {
//     id: "hairLossOnset",
//     label: "When did you first notice your hair loss?",
//     type: "select",
//     options: ["Less than 6 months ago", "6 months to 1 year ago", "1 to 5 years ago", "More than 5 years ago"],
//   },
//   {
//     id: "hairLossProgression",
//     label: "How quickly has your hair loss progressed?",
//     type: "select",
//     options: ["Slowly", "Moderately", "Quickly"],
//   },
//   {
//     id: "familyHistory",
//     label: "Do any of your male relatives have similar hair loss?",
//     type: "radio",
//     options: ["Yes", "No"],
//   },
//   {
//     id: "familyHistoryAge",
//     label: "If yes, at what age did they start losing hair?",
//     type: "text",
//     conditional: { questionId: "familyHistory", value: "Yes" },
//   },
//   {
//     id: "medicalConditions",
//     label: "Do you have any of the following conditions? (Select all that apply)",
//     type: "checkbox",
//     options: [
//       "Allergy to finasteride",
//       "Allergy to minoxidil",
//       "Heart conditions",
//       "Liver disease",
//       "Prostate cancer history",
//       "Low blood pressure",
//       "Scalp wounds or infections",
//       "Scalp sensitivity",
//       "Pregnant woman in household",
//       "Other medical conditions",
//       "No, I don't have any of these conditions",
//     ],
//   },
//   {
//     id: "otherMedicalConditions",
//     label: 'If you selected "Other medical conditions," please specify.',
//     type: "text",
//     conditional: { questionId: "medicalConditions", value: "Other medical conditions" },
//   },
//   {
//     id: "medications",
//     label: "Are you currently taking any medications?",
//     type: "radio",
//     options: ["Yes", "No"],
//   },
//   {
//     id: "medicationsList",
//     label: "If yes, please list them.",
//     type: "text",
//     conditional: { questionId: "medications", value: "Yes" },
//   },
//   {
//     id: "previousTreatments",
//     label: "Have you tried any hair loss treatments before?",
//     type: "radio",
//     options: ["Yes", "No"],
//   },
//   {
//     id: "previousTreatmentsDetails",
//     label: "If yes, please describe what you tried and the results.",
//     type: "text",
//     conditional: { questionId: "previousTreatments", value: "Yes" },
//   },
//   {
//     id: "treatmentGoals",
//     label: "What are your main goals for hair loss treatment? (Select all that apply)",
//     type: "checkbox",
//     options: ["Stop hair loss", "Regrow hair", "Improve appearance", "Other"],
//   },
//   {
//     id: "importance",
//     label: "How important is treating your hair loss to you? (1 = Not important, 10 = Very important)",
//     type: "scale",
//     options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
//   },
//   {
//     id: "commitment",
//     label: "Are you willing to follow a daily treatment routine for at least 6 months?",
//     type: "radio",
//     options: ["Yes", "No"],
//   },
//   {
//     id: "photos",
//     label:
//       "Please upload two photos of your scalp (front and back views). For best results, take the photos in good lighting with your hair dry and styled as usual.",
//     type: "file",
//   },
// ]
