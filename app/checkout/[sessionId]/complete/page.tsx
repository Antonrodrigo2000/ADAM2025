'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function CompletePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { session, isLoading, error } = useCheckoutSession()
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>('')

  // Extract sessionId from params
  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])

  useEffect(() => {
    if (!session || isLoading) return

    // Redirect if session is not completed
    if (session.status !== 'completed' || session.current_step !== 'complete') {
      if (sessionId) {
        router.replace(`/checkout/${sessionId}/${session.current_step}`)
      }
    }
  }, [session, isLoading, sessionId, router])

  if (isLoading) {
    return <CompleteLoadingSkeleton />
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="neomorphic-container p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Session Error</h2>
          <p className="text-neutral-600 mb-4">{error || 'Session not found'}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CheckoutProgressIndicator 
        currentStep="complete" 
        isAuthenticated={!!session.user_id} 
      />

      <div className="neomorphic-container p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-orange-500 rounded-full mx-auto"></div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-neutral-600 mb-6">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Order Details */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-green-800 mb-3">Order Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-green-700">Order ID:</span>
              <span className="font-mono text-green-800">{session.session_token.toUpperCase()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-green-700">Items:</span>
              <span className="text-green-800">{session.cart_items.length} item(s)</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-green-700">Total Amount:</span>
              <span className="font-bold text-green-800">LKR {session.cart_total.toLocaleString()}</span>
            </div>
            
            {session.completed_at && (
              <div className="flex justify-between items-center">
                <span className="text-green-700">Completed:</span>
                <span className="text-green-800">
                  {new Date(session.completed_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6 text-left">
          <h4 className="font-semibold text-neutral-800 mb-3">Items Ordered</h4>
          <div className="space-y-2">
            {session.cart_items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    {item.productName || `Product ${item.product_id.slice(-8).toUpperCase()}`}
                  </p>
                  <p className="text-xs text-neutral-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-800">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-600">
                    LKR {item.price.toLocaleString()} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
          <div className="text-sm text-blue-700 space-y-1 text-left">
            <p>• You'll receive an order confirmation email shortly</p>
            <p>• Our medical team will review your order</p>
            <p>• Once approved, your order will be processed and shipped</p>
            <p>• You'll receive tracking information via email</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/products')}
            className="w-full px-6 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <p className="text-xs text-neutral-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@adam.lk" className="text-orange-600 hover:underline">
              support@adam.lk
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function CompleteLoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="neomorphic-container p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-neutral-200 rounded-full mx-auto"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto"></div>
          <div className="h-32 bg-neutral-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}