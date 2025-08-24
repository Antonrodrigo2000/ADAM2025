"use client"

import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ConsultationPaymentWarningProps {
  hasConsultationItems: boolean
}

export function ConsultationPaymentWarning({ hasConsultationItems }: ConsultationPaymentWarningProps) {
  if (!hasConsultationItems) return null

  return (
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
  )
}