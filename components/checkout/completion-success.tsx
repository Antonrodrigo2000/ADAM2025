"use client"

import { CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CompletionSuccessProps {
  sessionToken: string
  onDashboard: () => void
  onContinueShopping: () => void
}

export function CompletionSuccess({ sessionToken, onDashboard, onContinueShopping }: CompletionSuccessProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-3">
            Payment successful!
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
            Your consultation payment has been processed. Our medical team will review your order.
          </p>
        </div>

        {/* Order Reference */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="text-center">
            <p className="text-xs text-green-600 mb-1">Order Reference</p>
            <p className="text-sm font-medium text-green-800">#{sessionToken.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <h4 className="font-medium text-blue-800 mb-3 text-center sm:text-left">What happens next?</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>You'll receive a consultation confirmation email</p>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Our medical team will review your questionnaire</p>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Once approved, you'll be charged for the products</p>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Track your order status in your dashboard</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onDashboard}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button
            onClick={onContinueShopping}
            variant="outline"
            className="flex-1"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-xs text-neutral-500">
            Need help?{' '}
            <a href="mailto:support@adam.lk" className="text-orange-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}