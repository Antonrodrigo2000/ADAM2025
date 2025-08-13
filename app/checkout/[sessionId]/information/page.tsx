'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { SinglePageCheckout } from '@/components/checkout/single-page-checkout'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { SessionOrderSummary } from '@/components/checkout/session-order-summary'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function InformationPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { session, updateSession, isLoading, error } = useCheckoutSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')

  // Extract sessionId from params
  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])

  // Redirect authenticated users to payment step
  useEffect(() => {
    if (session?.user_id && sessionId) {
      router.replace(`/checkout/${sessionId}/payment`)
    }
  }, [session?.user_id, sessionId, router])

  const handleSignupComplete = async (result: any) => {
    if (result.success) {
      setIsProcessing(true)
      try {
        // Update session with user info and progress to payment
        await updateSession({
          user_id: result.userId,
          customer_info: {
            first_name: result.firstName,
            last_name: result.lastName,
            email: result.email,
            phone: result.phone,
          },
          shipping_address: result.address,
          current_step: 'payment'
        })

        // Navigate to payment step
        router.push(`/checkout/${sessionId}/payment`)
      } catch (error) {
        console.error('Failed to update session after signup:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  if (isLoading) {
    return <CheckoutLoadingSkeleton />
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
      {/* Left side - Information Collection */}
      <div className="lg:col-span-2 space-y-5">
        <CheckoutProgressIndicator 
          currentStep="information" 
          isAuthenticated={!!session.user_id} 
        />


        {/* Signup Form */}
        <SinglePageCheckout 
          onComplete={handleSignupComplete}
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

function CheckoutLoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-5">
        <div className="neomorphic-container p-4">
          <div className="animate-pulse h-16 bg-neutral-200 rounded"></div>
        </div>
        <div className="neomorphic-container p-4 md:p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-10 bg-neutral-200 rounded w-full"></div>
            <div className="h-10 bg-neutral-200 rounded w-full"></div>
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