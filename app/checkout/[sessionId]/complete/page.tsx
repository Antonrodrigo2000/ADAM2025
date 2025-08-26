'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { CompletionSuccess } from '@/components/checkout/completion-success'
import { CompletionError } from '@/components/checkout/completion-error'
import { CompletionLoading } from '@/components/checkout/completion-loading'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    if (session.status !== 'completed') {
      if (sessionId) {
        router.replace(`/checkout/${sessionId}/${session.current_step}`)
      }
    }
  }, [session, isLoading, sessionId, router])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <CheckoutProgressIndicator 
          currentStep="complete" 
          isAuthenticated={true} 
        />
        <div className="mt-6">
          <CompletionLoading />
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <CheckoutProgressIndicator 
          currentStep="complete" 
          isAuthenticated={true} 
        />
        <div className="mt-6">
          <CompletionError 
            error={error || 'Session not found'}
            onRetry={() => router.push('/dashboard')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <CheckoutProgressIndicator 
        currentStep="complete" 
        isAuthenticated={!!session.user_id} 
      />

      <div className="mt-6">
        <CompletionSuccess
          sessionToken={session.session_token}
          onDashboard={() => router.push('/dashboard')}
          onContinueShopping={() => router.push('/products')}
        />
      </div>
    </div>
  )
}