'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { AddressPaymentView } from '@/components/checkout/address-payment-view'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { SessionOrderSummary } from '@/components/checkout/session-order-summary'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { session, progressToStep, isLoading, error } = useCheckoutSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')

  // Extract sessionId from params
  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])


  // Redirect to information step if user is not set in session
  useEffect(() => {
    if (session && !session.user_id && sessionId) {
      router.replace(`/checkout/${sessionId}/information`)
    }
  }, [session, sessionId, router])

  const handlePayNow = async (addressId?: string, paymentMethodId?: string) => {
    if (!session) return

    setIsProcessing(true)
    try {
      // Update session to processing step
      await progressToStep('processing')
      
      // Call payment API
      const response = await fetch('/api/checkout/address-payment/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.session_token,
          addressId,
          paymentMethodId,
          cartItems: session.cart_items,
          cartTotal: session.cart_total,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Navigate to processing page
        router.push(`/checkout/${sessionId}/processing`)
      } else {
        throw new Error(result.error || 'Payment processing failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      // Show error to user - could add toast notification here
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <PaymentLoadingSkeleton />
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

  return (
    <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
      {/* Left side - Address & Payment */}
      <div className="lg:col-span-2 space-y-5">
        <CheckoutProgressIndicator 
          currentStep="payment" 
          isAuthenticated={!!session.user_id} 
        />


        {/* Customer Info Summary (if from information step) */}
        {session.customer_info && (
          <div className="neomorphic-container p-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-2">Customer Information</h3>
            <div className="text-sm text-neutral-600">
              <p>{session.customer_info.first_name} {session.customer_info.last_name}</p>
              <p>{session.customer_info.email}</p>
              {session.customer_info.phone && <p>{session.customer_info.phone}</p>}
            </div>
          </div>
        )}

        {/* Address & Payment Form */}
        <AddressPaymentView
          user={session.user_id ? { id: session.user_id, email: '' } : null}
          onPayNow={handlePayNow}
          isProcessing={isProcessing}
        />
      </div>

      {/* Right side - Order Summary */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-5">
          <SessionOrderSummary session={session} />
        </div>
      </div>
    </div>
  )
}


function PaymentLoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-5">
        <div className="neomorphic-container p-4">
          <div className="animate-pulse h-16 bg-neutral-200 rounded"></div>
        </div>
        <div className="neomorphic-container p-4 md:p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-32 bg-neutral-200 rounded w-full"></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="neomorphic-container p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}