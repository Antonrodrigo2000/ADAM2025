export interface CheckoutFlowResult {
  flowType: 'signup_with_questionnaire' | 'signup_without_questionnaire' | 'authenticated_user'
  requiresSignup: boolean
  requiresQuestionnaire: boolean
  nextStep: 'address_payment' | 'dashboard'
}

export interface AddressPaymentData {
  deliveryAddress: {
    street: string
    city: string
    postcode: string
    country: string
  }
  paymentCards: PaymentCard[]
}

export interface PaymentCard {
  id: string
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

export interface CheckoutFlowState {
  userId: string
  isAuthenticated: boolean
  isNewUser: boolean
  requiresQuestionnaire: boolean
  addressPaymentData?: AddressPaymentData
  orderId?: string
}