export interface Product {
  id: string
  name: string
  slug: string
  description: string
  active_ingredient: string
  dosage: string
  price: number
  consultation_fee: number
  consultation_required: boolean
  health_vertical_id: string
  health_vertical: {
    name: string
    slug: string
  }
  images: ProductImage[]
  rating: number
  review_count: number
  benefits: string[]
  how_it_works: string
  expected_timeline: string
  ingredients: Ingredient[]
  side_effects: string[]
  contraindications: string[]
  warnings: string[]
  clinical_studies: ClinicalStudy[]
  faqs: FAQ[]
}

export interface ProductImage {
  id: string
  url: string
  alt_text: string
  is_primary: boolean
}

export interface Ingredient {
  name: string
  dosage: string
  description: string
}

export interface ClinicalStudy {
  title: string
  description: string
  efficacy_rate: number
  study_url: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  verified_purchase: boolean
  created_at: string
}
