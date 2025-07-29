export interface HealthVertical {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  productCount: number
  icon: string
  gradient: string
}

export interface TrustBadge {
  icon: string
  title: string
  description: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  consultationFee?: number
  prescriptionRequired: boolean
  activeIngredient?: string
  dosage?: string
  healthVerticalId: string
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
}

export interface ProductReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  verifiedPurchase: boolean
  createdAt: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
}
