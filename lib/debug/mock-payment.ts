/**
 * Debug utility to simulate successful consultation payments
 * Only works when DEBUG=true in environment
 */

interface MockPaymentRequest {
    sessionId: string
    userId: string
    transactionId?: string
}

interface MockPaymentResponse {
    success: boolean
    message: string
    data?: any
    redirect_url?: string
    error?: string
}

export async function simulateConsultationPayment(
    request: MockPaymentRequest
): Promise<MockPaymentResponse> {
    
    if (process.env.NODE_ENV === 'production' && process.env.DEBUG !== 'true') {
        throw new Error('Mock payments are not allowed in production')
    }

    try {
        const response = await fetch('/api/webhooks/genie-payments/mock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        })

        const result = await response.json()
        
        if (!response.ok) {
            throw new Error(result.error || 'Mock payment failed')
        }

        console.log('🧪 DEBUG: Mock consultation payment successful', result)
        return result

    } catch (error) {
        console.error('🧪 DEBUG: Mock payment error:', error)
        throw error
    }
}

/**
 * React hook for easier usage in components
 */
export function useMockPayment() {
    const triggerMockPayment = async (sessionId: string, userId: string) => {
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEBUG !== 'true') {
            console.warn('Mock payments not available in production')
            return
        }

        try {
            return await simulateConsultationPayment({ sessionId, userId })
        } catch (error) {
            console.error('Mock payment failed:', error)
            throw error
        }
    }

    return {
        triggerMockPayment,
        isDebugMode: process.env.NEXT_PUBLIC_DEBUG === 'true'
    }
}