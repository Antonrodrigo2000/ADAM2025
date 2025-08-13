'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProcessingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { session, updateSession, isLoading, error } = useCheckoutSession()
  const router = useRouter()
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  // Extract sessionId from params
  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])

  useEffect(() => {
    if (!session || isLoading) return

    // Redirect if not on processing step
    if (session.current_step !== 'processing') {
      if (sessionId) {
        router.replace(`/checkout/${sessionId}/${session.current_step}`)
      }
      return
    }

    // Simulate payment processing
    const processPayment = async () => {
      try {
        // Wait a bit to show processing state
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Complete the session
        const response = await fetch(`/api/checkout/${sessionId}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_intent_id: `pi_${Date.now()}`,
            order_id: `order_${Date.now()}`,
          }),
        })

        const result = await response.json()

        if (result.success) {
          // Navigate to completion page
          router.push(`/checkout/${sessionId}/complete`)
        } else {
          throw new Error(result.error || 'Payment completion failed')
        }
      } catch (error) {
        console.error('Payment processing error:', error)
        setProcessingError(error instanceof Error ? error.message : 'Payment processing failed')
      }
    }

    processPayment()
  }, [session, isLoading, sessionId, router])

  if (isLoading) {
    return <ProcessingLoadingSkeleton />
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="neomorphic-container p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Session Error</h2>
          <p className="text-neutral-600 mb-4">{error || 'Session not found'}</p>
          <button 
            onClick={() => router.push('/cart')}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Return to Cart
          </button>
        </div>
      </div>
    )
  }

  if (processingError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="neomorphic-container p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h2>
          <p className="text-neutral-600 mb-4">{processingError}</p>
          <div className="space-x-3">
            <button 
              onClick={() => router.push(`/checkout/${sessionId}/payment`)}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/cart')}
              className="px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CheckoutProgressIndicator 
        currentStep="processing" 
        isAuthenticated={!!session.user_id} 
      />

      <div className="neomorphic-container p-8 text-center">
        {/* Processing Animation */}
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Processing Text */}
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Processing your order...</h2>
        <p className="text-neutral-600 mb-6">Please wait while we complete your purchase.</p>
        
        {/* Order Summary */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-left">
          <h3 className="font-semibold text-neutral-800 mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm text-neutral-600">
            <div className="flex justify-between">
              <span>Items ({session.cart_items.length})</span>
              <span>LKR {session.cart_total.toLocaleString()}</span>
            </div>
            {session.cart_items.map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span>{item.productName || `Product ${item.product_id.slice(-8)}`} × {item.quantity}</span>
                <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>LKR {session.cart_total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function ProcessingLoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="neomorphic-container p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-neutral-200 rounded-full mx-auto"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}