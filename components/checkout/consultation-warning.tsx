'use client'

import { AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ConsultationValidationService } from '@/lib/services/consultation-validation'

interface ConsultationWarningProps {
  missingHealthVerticals: string[]
}

export function ConsultationWarning({ missingHealthVerticals }: ConsultationWarningProps) {
  if (missingHealthVerticals.length === 0) {
    return null
  }

  return (
    <Card className="bg-orange-50 border-orange-200 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-800 mb-2">
            Questionnaire Required
          </h3>
          <p className="text-sm text-orange-700 mb-3">
            Your cart contains prescription products that require consultation. 
            You must complete the questionnaires for the following areas before proceeding:
          </p>
          
          <div className="space-y-2">
            {missingHealthVerticals.map((vertical) => (
              <div key={vertical} className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">
                  {ConsultationValidationService.getHealthVerticalDisplayName(vertical)}
                </span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Link href={`/questionnaire/${vertical}`}>
                    Complete <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-orange-600 mt-3">
            After completing the required questionnaires, return to checkout to proceed with your order.
          </p>
        </div>
      </div>
    </Card>
  )
}