export interface Product {
  id: string
  name: string
  slug: string
  description: string
  active_ingredient: string
  dosage: string
  price: number
  consultation_fee: number
  prescription_required: boolean
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
  ingredients: ProductIngredient[]
  side_effects: string[]
  contraindications: string[]
  warnings: string[]
  clinical_studies?: string
  faqs: ProductFAQ[]
  related_products?: Product[]
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  is_primary: boolean
}

export interface ProductIngredient {
  name: string
  dosage: string
  description: string
}

export interface ProductFAQ {
  id: string
  question: string
  answer: string
}

export interface ProductReview {
  id: string
  user_name: string
  rating: number
  comment: string
  verified_purchase: boolean
  created_at: string
}
