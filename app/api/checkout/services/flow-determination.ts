import { getServerAuth } from '@/contexts/auth-server'
import type { CartItem } from '@/contexts/types'
import type { CheckoutFlowResult } from './flow-types'

export async function determineCheckoutFlow(cartItems: CartItem[]): Promise<CheckoutFlowResult> {
  const { user, isAuthenticated } = await getServerAuth()
  
  // Check if any cart items require questionnaire
  const requiresQuestionnaire = cartItems.some(item => item.requiresQuestionnaire === true)
  
  if (isAuthenticated && user) {
    // Authenticated user - go directly to address/payment view
    // Still check if they need questionnaire for new products they haven't bought before
    return {
      flowType: 'authenticated_user',
      requiresSignup: false,
      requiresQuestionnaire: requiresQuestionnaire, // May still need questionnaire for new product types
      nextStep: 'address_payment'
    }
  }
  
  if (requiresQuestionnaire) {
    // New user with questionnaire products
    return {
      flowType: 'signup_with_questionnaire',
      requiresSignup: true,
      requiresQuestionnaire: true,
      nextStep: 'address_payment'
    }
  }
  
  // New user without questionnaire products
  return {
    flowType: 'signup_without_questionnaire',
    requiresSignup: true,
    requiresQuestionnaire: false,
    nextStep: 'address_payment'
  }
}