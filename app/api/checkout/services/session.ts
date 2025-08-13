import { handleUserAuth, type UserAuthResult } from './auth'
import { saveQuizResponses } from './quiz'
import { createOrder, type OrderResult } from './order'
import { handleEmedIntegration } from './emed'
import { handleGenieIntegration } from './genie'
import { determineCheckoutFlow } from './flow-determination'
import { getUserAddressPaymentData } from './address-payment'
import { getServerAuth } from '@/contexts/auth-server'
import type { CheckoutRequest } from './validation'
import type { AddressPaymentData } from './flow-types'

export interface CheckoutSession {
    controller: AbortController
    userId?: string
    isNewUser?: boolean
}

export type CheckoutSessionResult = {
    success: true
    flowType: 'signup_with_questionnaire' | 'signup_without_questionnaire' | 'authenticated_user'
    orderId?: string
    userId: string
    isNewUser: boolean
    nextStep: 'address_payment' | 'dashboard'
    addressPaymentData?: AddressPaymentData
    message: string
} | {
    success: false
    error: string
}

export async function executeCheckoutSession(body: CheckoutRequest): Promise<CheckoutSessionResult> {
    const controller = new AbortController()
    const signal = controller.signal

    try {
        // Step 1: Determine checkout flow
        const flow = await determineCheckoutFlow(body.cartItems)
        
        if (flow.flowType === 'authenticated_user') {
            // Get authenticated user details
            const { user } = await getServerAuth()
            if (!user) {
                return {
                    success: false,
                    error: 'User authentication failed'
                }
            }
            
            // Handle eMed integration for authenticated users if needed
            if (flow.requiresQuestionnaire) {
                try {
                    await handleEmedIntegration(user.id, body, flow.requiresQuestionnaire, signal)
                } catch (error) {
                    console.error('eMed integration failed for authenticated user:', error)
                    // Don't fail the flow, continue to address/payment
                }
            }
            
            // Get address/payment data for authenticated user
            const addressPaymentData = await getUserAddressPaymentData(user.id)
            
            return {
                success: true,
                flowType: 'authenticated_user',
                userId: user.id,
                isNewUser: false,
                nextStep: 'address_payment',
                addressPaymentData: addressPaymentData || undefined,
                message: 'Proceed to address and payment'
            }
        }

        // Step 2: Handle user authentication for new users
        const authResult: UserAuthResult = await handleUserAuth(body, signal)
        if (authResult.error) {
            return {
                success: false,
                error: authResult.error
            }
        }

        // Step 3: Save quiz responses only if product requires questionnaire
        if (flow.requiresQuestionnaire) {
            try {
                await saveQuizResponses(authResult.userId, body, signal)
            } catch (error) {
                console.error('Quiz save failed, continuing with checkout:', error)
            }
        }

        // Step 4: Handle eMed integration - always create patient, conditionally save questionnaire
        try {
            await handleEmedIntegration(authResult.userId, body, flow.requiresQuestionnaire, signal)
        } catch (error) {
            console.error('eMed integration failed:', error)
        }

        // Step 5: Create order
        const orderResult: OrderResult = await createOrder(authResult.userId, body, signal)

        // Step 6: Create Genie Customer
        try {
            await handleGenieIntegration(signal)
        } catch (error) {
            console.error('Genie integration failed:', error)
        }

        return {
            success: true,
            flowType: flow.flowType,
            orderId: orderResult.orderId,
            userId: authResult.userId,
            isNewUser: authResult.isNewUser,
            nextStep: 'address_payment',
            message: authResult.isNewUser
                ? 'Account created successfully. Please complete your address and payment details.'
                : 'Order placed successfully'
        }

    } catch (error) {
        // Cancel all pending operations
        controller.abort()

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : 'An unexpected error occurred during checkout'
        }
    }
}