"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMockPayment } from "@/lib/debug/mock-payment"

interface PaymentActionProps {
    hasAddress: boolean
    hasSelectedPaymentMethod: boolean
    isProcessing: boolean
    isValidatingConsultation: boolean
    consultationValidation: {
        requiresConsultation: boolean
        isValid: boolean
    }
    onPayNow: () => void
    sessionId?: string
    userId?: string
}

export function PaymentAction({ 
    hasAddress,
    hasSelectedPaymentMethod,
    isProcessing,
    isValidatingConsultation,
    consultationValidation,
    onPayNow,
    sessionId,
    userId
}: PaymentActionProps) {
    const { triggerMockPayment, isDebugMode } = useMockPayment()
    const [isMockProcessing, setIsMockProcessing] = useState(false)
    const canProceed = hasAddress && 
                      hasSelectedPaymentMethod && 
                      !isProcessing && 
                      !isValidatingConsultation &&
                      (!consultationValidation.requiresConsultation || consultationValidation.isValid)

    const handleMockPayment = async () => {
        if (!sessionId || !userId) {
            console.error('SessionId and userId required for mock payment')
            return
        }

        try {
            setIsMockProcessing(true)
            const result = await triggerMockPayment(sessionId, userId)
            // Small delay to ensure webhook processing is complete
            await new Promise(resolve => setTimeout(resolve, 1000))
            // Use redirect_url from response if available, otherwise fallback to default
            const redirectUrl = result.redirect_url || `/checkout/${sessionId}/complete`
            window.location.href = redirectUrl
        } catch (error) {
            console.error('Mock payment failed:', error)
            alert('Mock payment failed. Check console for details.')
        } finally {
            setIsMockProcessing(false)
        }
    }

    const getErrorMessage = () => {
        if (!hasAddress || !hasSelectedPaymentMethod) {
            return 'Please complete your delivery address and select a payment method'
        }
        if (consultationValidation.requiresConsultation && !consultationValidation.isValid) {
            return 'Please complete the required questionnaires before proceeding'
        }
        return null
    }

    return (
        <div className="space-y-4">
            {/* Pay Now Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <Button
                    onClick={onPayNow}
                    disabled={!canProceed || isMockProcessing}
                    size="lg"
                    className="w-full h-12 text-base bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing Payment...' : 
                     isValidatingConsultation ? 'Validating Requirements...' :
                     'Pay Now →'}
                </Button>

                {!canProceed && (
                    <p className="text-xs text-orange-600 mt-3 text-center">
                        {getErrorMessage()}
                    </p>
                )}
            </div>

            {/* Debug Mock Payment Section */}
            {isDebugMode && consultationValidation.requiresConsultation && (
                <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🧪</span>
                        <h3 className="font-medium text-yellow-800">Debug Mode</h3>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                        Skip Genie IPG payment and simulate successful consultation payment
                    </p>
                    <Button
                        onClick={handleMockPayment}
                        disabled={!sessionId || !userId || isMockProcessing}
                        size="sm"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                        {isMockProcessing ? 'Simulating Payment...' : '🧪 Mock Payment Success'}
                    </Button>
                    {(!sessionId || !userId) && (
                        <p className="text-xs text-yellow-600 mt-2">
                            Session ID and User ID required for mock payment
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}