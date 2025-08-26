"use client"

import { CheckCircle, XCircle } from "lucide-react"

interface ProcessingStatusProps {
  status: 'processing' | 'success' | 'failed'
  message: string
  onRetry?: () => void
  onSupport?: () => void
}

export function ProcessingStatus({ status, message, onRetry, onSupport }: ProcessingStatusProps) {
  return (
    <>
      {/* Status Icon */}
      <div className="mb-6">
        {status === 'processing' && (
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-orange-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        )}

        {status === 'failed' && (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-2">
          {status === 'processing' ? 'Processing your payment' : 
           status === 'success' ? 'Payment successful!' : 'Payment failed'}
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {/* Action Buttons for Failed State */}
      {status === 'failed' && onRetry && onSupport && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onSupport}
            className="px-6 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors"
          >
            Contact Support
          </button>
        </div>
      )}

      {/* Success Redirect Message */}
      {status === 'success' && (
        <div className="mb-8">
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg py-2 px-4 inline-block">
            Redirecting you to the confirmation page...
          </p>
        </div>
      )}
    </>
  )
}