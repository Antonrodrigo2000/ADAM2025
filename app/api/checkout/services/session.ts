import { handleUserAuth, type UserAuthResult } from './auth'
import { saveQuizResponses } from './quiz'
import { createOrder, type OrderResult } from './order'
import { handleEmedIntegration } from './emed'
import type { CheckoutRequest } from './validation'

export interface CheckoutSession {
    controller: AbortController
    userId?: string
    isNewUser?: boolean
}

export type CheckoutSessionResult = {
    success: true
    orderId: string
    userId: string
    isNewUser: boolean
    redirectUrl: string
    message: string
} | {
    success: false
    error: string
}

export async function executeCheckoutSession(body: CheckoutRequest): Promise<CheckoutSessionResult> {
    const controller = new AbortController()
    const signal = controller.signal

    try {
        // Step 1: Handle user authentication
        const authResult: UserAuthResult = await handleUserAuth(body, signal)
        if (authResult.error) {
            return {
                success: false,
                error: authResult.error
            }
        }

        // Step 2: Save quiz responses (non-blocking - don't fail entire session)
        try {
            await saveQuizResponses(authResult.userId, body, signal)
        } catch (error) {
            console.error('Quiz save failed, continuing with checkout:', error)
        }

        // Step 3: Create order
        const orderResult: OrderResult = await createOrder(authResult.userId, body, signal)

        // Step 4: Handle eMed integration (non-blocking - don't fail entire session)
        try {
            await handleEmedIntegration(authResult.userId, body, signal)
        } catch (error) {
            // eMed integration failed, but continue with checkout
            // Error logging is handled within handleEmedIntegration
        }

        //step 5: Create Genie Customer

        return {
            success: true,
            orderId: orderResult.orderId,
            userId: authResult.userId,
            isNewUser: authResult.isNewUser,
            redirectUrl: orderResult.redirectUrl,
            message: authResult.isNewUser
                ? 'Account created and order placed successfully'
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