"use client"

import type React from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PaymentActionProps {
    hasConsultationItems: boolean
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
    hasConsultationItems,
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
            {/* Consultation Payment Warning */}
            {hasConsultationItems && (
                <Card className="border-amber-200 bg-amber-50/50">
                    <div className="p-4">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-amber-800">Consultation Required - Two-Step Payment Process</h4>
                                <p className="text-sm text-amber-700 leading-relaxed">
                                    Your cart contains prescription medications. You will first be charged the consultation fee (LKR 1,000). 
                                    After your online consultation and physician approval, the product charges will be processed separately. 
                                    If the consultation is not approved, only the consultation fee applies.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

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