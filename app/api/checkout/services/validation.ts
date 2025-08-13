import type { CartItem } from '@/contexts/types'

export interface CheckoutRequest {
  email: string
  password: string
  legalFirstName: string
  legalSurname: string
  dateOfBirth: string
  phoneNumber: string
  sex: string
  postcode: string
  city: string
  address: string
  agreeToTerms: boolean
  marketingOptOut: boolean
  cartItems: CartItem[]
  cartTotal: number
  quizResponses?: Record<string, any>
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateCheckoutRequest(body: CheckoutRequest): ValidationResult {
  // Check if cart is empty first
  if (!body.cartItems || body.cartItems.length === 0) {
    return {
      isValid: false,
      error: 'Cart is empty'
    }
  }

  // For authenticated users, we only need cart validation
  // For new users, we need all signup fields
  if (body.email && body.password) {
    // New user signup validation
    if (!body.legalFirstName || !body.legalSurname ||
        !body.dateOfBirth || !body.phoneNumber || !body.sex || !body.postcode ||
        !body.city || !body.address || body.cartTotal === undefined) {
      return {
        isValid: false,
        error: 'Missing required fields for new user signup'
      }
    }

    if (!body.agreeToTerms) {
      return {
        isValid: false,
        error: 'You must agree to the terms and conditions'
      }
    }
  }

  return { isValid: true }
}