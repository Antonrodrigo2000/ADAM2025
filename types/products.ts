export interface HealthVertical {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  productCount: number
  startingPrice: number
  gradient: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  consultationFee?: number
  prescriptionRequired: boolean
  healthVerticalId: string
  activeIngredient?: string
  dosage?: string
  images: string[]
  rating: number
  reviewCount: number
  benefits: string[]
  ingredients: Ingredient[]
  sideEffects: string[]
  contraindications: string[]
  faqs: FAQ[]
}

export interface Ingredient {
  name: string
  concentration: string
  purpose: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  verifiedPurchase: boolean
  createdAt: string
}
