'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AddCardSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Get transaction details from URL params
    const transactionId = searchParams.get('transactionId')
    const state = searchParams.get('state')
    
    if (!transactionId) {
      setStatus('error')
      setMessage('Invalid request - missing transaction details')
      return
    }

    // Check transaction status
    if (state === 'CONFIRMED') {
      setStatus('success')
      setMessage('Your payment method has been added successfully!')
    } else if (state === 'FAILED' || state === 'CANCELLED') {
      setStatus('error')
      setMessage('Failed to add payment method. Please try again.')
    } else {
      // Still processing or other state
      setStatus('loading')
      setMessage('Processing your payment method...')
      
      // Redirect back after a delay if still processing
      setTimeout(() => {
        router.push('/checkout/payment')
      }, 3000)
    }
  }, [searchParams, router])

  const handleContinue = () => {
    // Redirect back to the checkout payment page
    router.push('/checkout/payment')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-teal-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-neutral-800 mb-2">
              Processing Payment Method
            </h1>
            <p className="text-neutral-600 mb-4">{message}</p>
            <p className="text-sm text-neutral-500">
              Please wait while we process your payment method...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-neutral-800 mb-2">
              Payment Method Added!
            </h1>
            <p className="text-neutral-600 mb-6">{message}</p>
            <Button 
              onClick={handleContinue}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              Continue to Checkout
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-neutral-800 mb-2">
              Unable to Add Payment Method
            </h1>
            <p className="text-neutral-600 mb-6">{message}</p>
            <div className="space-y-2">
              <Button 
                onClick={handleContinue}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                Return to Checkout
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}