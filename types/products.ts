export interface HealthVertical {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  pricing_from: number
  product_count: number
  gradient_from: string
  gradient_to: string
}

export interface TrustBadge {
  id: string
  title: string
  description: string
  icon: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  min_price: number
  product_count: number
}
