"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

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
}

export function PaymentAction({ 
    hasAddress,
    hasSelectedPaymentMethod,
    isProcessing,
    isValidatingConsultation,
    consultationValidation,
    onPayNow
}: PaymentActionProps) {
    const canProceed = hasAddress && 
                      hasSelectedPaymentMethod && 
                      !isProcessing && 
                      !isValidatingConsultation &&
                      (!consultationValidation.requiresConsultation || consultationValidation.isValid)

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
                    disabled={!canProceed}
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
        </div>
    )
}