interface PatientData {
  age: number
  gender: string
  hairLossAreas: string[]
  hairLossOnset: string
  hairLossProgression: string
  familyHistory: string
  familyHistoryAge?: string
  medicalConditions: string[]
  otherMedicalConditions?: string
  medications: string
  medicationsList?: string
  previousTreatments: string
  previousTreatmentsDetails?: string
  treatmentGoals: string[]
  importance: number
  commitment: string
  photos: File[]
}

interface RecommendationResult {
  recommendation: string
  message: string
  riskScore?: number
}

const absoluteContraindications = ["Allergy to minoxidil", "Heart conditions", "Scalp wounds or infections"]

const finasterideContraindications = [
  "Allergy to finasteride",
  "Liver disease",
  "Prostate cancer history",
  "Pregnant woman in household",
]

const relativeContraindications = ["Low blood pressure", "Scalp sensitivity"]

function checkEligibility(data: PatientData): boolean {
  if (data.age < 18 || data.gender !== "Male") return false
  if (data.hairLossAreas.includes("Patches of complete hair loss (bald spots)")) return false
  return true
}

function assessHairLossPattern(data: PatientData): string {
  if (data.hairLossAreas.includes("Patches of complete hair loss (bald spots)")) {
    return "Patchy Hair Loss"
  }
  if (data.hairLossAreas.includes("Overall thinning (hair getting thinner everywhere)")) {
    return "Diffuse Thinning"
  }
  if (
    data.hairLossAreas.includes("Temples (sides of forehead)") ||
    data.hairLossAreas.includes("Crown (top back of head)")
  ) {
    return "Androgenetic Alopecia"
  }
  return "Scarring/Unusual Pattern"
}

function determineNorwoodScale(data: PatientData): number {
  // Simplified Norwood scale estimation based on hair loss areas
  if (
    data.hairLossAreas.includes("Temples (sides of forehead)") &&
    data.hairLossAreas.includes("Crown (top back of head)")
  ) {
    return 4 // Moderate hair loss
  } else if (data.hairLossAreas.includes("Temples (sides of forehead)")) {
    return 2 // Mild hair loss
  } else if (data.hairLossAreas.includes("Crown (top back of head)")) {
    return 3 // Mild to moderate hair loss
  }
  return 1 // Minimal hair loss
}

function calculateRiskScore(data: PatientData): number {
  let score = 0

  // Age factor (higher age = higher risk)
  if (data.age >= 40) score += 2
  else if (data.age >= 30) score += 1

  // Family history
  if (data.familyHistory === "Yes") score += 2

  // Hair loss progression
  if (data.hairLossProgression === "Quickly") score += 3
  else if (data.hairLossProgression === "Moderately") score += 2
  else score += 1

  // Hair loss onset
  if (data.hairLossOnset === "More than 5 years ago") score += 2
  else if (data.hairLossOnset === "1 to 5 years ago") score += 1

  // Number of areas affected
  score += data.hairLossAreas.length

  // Medical conditions (contraindications increase risk)
  if (data.medicalConditions.length > 0) score += 1

  // Commitment level (lower commitment = higher risk of failure)
  if (data.commitment === "No") score += 3

  return Math.min(score, 10) // Cap at 10
}

function recommendTreatment(data: PatientData): RecommendationResult {
  // Step 1: Eligibility Screening
  if (!checkEligibility(data)) {
    return {
      recommendation: "Refer to dermatologist",
      message:
        "Patient does not meet eligibility criteria (e.g., age < 18, female, or patchy hair loss). Refer to a dermatologist for evaluation.",
    }
  }

  // Step 2: Hair Loss Pattern Assessment
  const hairLossPattern = assessHairLossPattern(data)
  if (hairLossPattern === "Patchy Hair Loss" || hairLossPattern === "Scarring/Unusual Pattern") {
    return {
      recommendation: "Refer to dermatologist",
      message: "Suspected alopecia areata or scarring alopecia detected. Specialist evaluation required.",
    }
  }

  // Step 3: Medical History Screening
  const hasAbsoluteContraindication = data.medicalConditions.some((condition) =>
    absoluteContraindications.includes(condition),
  )
  if (hasAbsoluteContraindication) {
    return {
      recommendation: "Deny treatment",
      message:
        "Absolute contraindications detected (e.g., minoxidil allergy, severe cardiovascular disease, scalp wounds). Consider non-prescription alternatives or refer to a specialist.",
    }
  }

  const hasFinasterideContraindication = data.medicalConditions.some((condition) =>
    finasterideContraindications.includes(condition),
  )
  const hasRelativeContraindication = data.medicalConditions.some((condition) =>
    relativeContraindications.includes(condition),
  )

  // Step 4: Treatment Selection
  let recommendation = ""
  let message = ""

  if (hasFinasterideContraindication) {
    recommendation = "Minoxidil 5% Standalone"
    message =
      "Recommended: ADAM Minoxidil 5%. Apply 1 ml twice daily to dry scalp. Finasteride is contraindicated due to medical history (e.g., finasteride allergy, liver disease, pregnancy in household)."
  } else {
    recommendation = "Minoxidil + Finasteride Spray"
    message =
      "Recommended: ADAM Personalized Minoxidil + Finasteride Spray (Minoxidil 5% + Finasteride 0.1%). Apply 1 ml twice daily. This is the first-line treatment for male pattern baldness."
  }

  // Additional considerations
  const norwoodScale = determineNorwoodScale(data)
  if (norwoodScale >= 6) {
    message +=
      " Note: For severe hair loss (Norwood 6-7), discuss realistic expectations with the physician, as topical treatments may offer limited benefit."
  }

  if (data.previousTreatments === "Yes") {
    message +=
      " Note: Patient has tried previous hair loss treatments. Discuss outcomes and consider alternatives if previous combination therapy failed."
  }

  if (hasRelativeContraindication) {
    message +=
      " Caution: Relative contraindications (e.g., severe hypotension, scalp sensitivity) present. Monitor closely or consider alternatives."
  }

  if (data.medicalConditions.includes("Scalp sensitivity")) {
    message +=
      " Note: Patient has scalp sensitivity. Consider starting with a lower frequency or concentration to assess tolerance."
  }

  // Calculate risk score
  const riskScore = calculateRiskScore(data)

  return { recommendation, message, riskScore }
}

export default recommendTreatment
export type { PatientData, RecommendationResult }
