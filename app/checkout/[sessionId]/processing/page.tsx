'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProcessingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { session, updateSession, isLoading, error } = useCheckoutSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const [statusMessage, setStatusMessage] = useState('Processing your payment...')
  const [orderId, setOrderId] = useState<string | null>(null)

  // Extract sessionId from params
  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])

  const type = searchParams.get('type') // 'consultation' or 'products'
  const transactionId = searchParams.get('tx')

  useEffect(() => {
    if (!sessionId || !transactionId) return

    // Handle consultation/product payment processing based on URL params
    const checkPaymentStatus = async () => {
      try {
        const supabase = createClient()

        if (type === 'consultation') {
          // Check for consultation payment confirmation
          setStatusMessage('Processing consultation payment...')
          
          // Poll for order creation (happens in webhook after consultation payment confirms)
          let attempts = 0
          const maxAttempts = 30 // 30 seconds timeout
          
          const pollForOrder = async (): Promise<void> => {
            attempts++
            console.log(`🔍 Polling for order creation, attempt ${attempts}/${maxAttempts}`)

            // Look for order with consultation payment ID
            const { data: order, error } = await supabase
              .from('orders')
              .select('id, status, consultation_status, payment_status')
              .eq('consultation_payment_id', transactionId)
              .single()

            if (order) {
              console.log('✅ Order found:', order)
              setOrderId(order.id)
              
              if (order.consultation_status === 'paid') {
                setPaymentStatus('success')
                setStatusMessage('Consultation payment successful! Your order is being reviewed by our medical team.')
                
                // Redirect to success page after 3 seconds
                setTimeout(() => {
                  router.push(`/checkout/${sessionId}/complete?order=${order.id}&type=consultation`)
                }, 3000)
                return
              } else if (order.consultation_status === 'failed') {
                setPaymentStatus('failed')
                setStatusMessage('Consultation payment failed. Please try again.')
                setProcessingError('Consultation payment failed')
                return
              }
            }

            if (attempts < maxAttempts) {
              setTimeout(pollForOrder, 1000) // Poll every second
            } else {
              setPaymentStatus('failed')
              setStatusMessage('Payment processing timeout. Please contact support if your payment was charged.')
              setProcessingError('Payment processing timeout')
            }
          }

          // Start polling after a short delay
          setTimeout(pollForOrder, 2000)

        } else if (type === 'products') {
          // Check for product payment confirmation
          setStatusMessage('Processing product payment...')
          
          let attempts = 0
          const maxAttempts = 30
          
          const pollForProductPayment = async (): Promise<void> => {
            attempts++
            console.log(`🔍 Polling for product payment, attempt ${attempts}/${maxAttempts}`)

            // Look for order with product payment ID
            const { data: order, error } = await supabase
              .from('orders')
              .select('id, status, product_payment_status, payment_status')
              .eq('product_payment_id', transactionId)
              .single()

            if (order) {
              console.log('✅ Product payment order found:', order)
              setOrderId(order.id)
              
              if (order.product_payment_status === 'paid' || order.payment_status === 'fully_paid') {
                setPaymentStatus('success')
                setStatusMessage('Payment successful! Your order is being processed.')
                
                // Redirect to success page after 3 seconds
                setTimeout(() => {
                  router.push(`/checkout/${sessionId}/complete?order=${order.id}&type=complete`)
                }, 3000)
                return
              } else if (order.product_payment_status === 'failed') {
                setPaymentStatus('failed')
                setStatusMessage('Product payment failed. Please try again.')
                setProcessingError('Product payment failed')
                return
              }
            }

            if (attempts < maxAttempts) {
              setTimeout(pollForProductPayment, 1000)
            } else {
              setPaymentStatus('failed')
              setStatusMessage('Payment processing timeout. Please contact support if your payment was charged.')
              setProcessingError('Payment processing timeout')
            }
          }

          setTimeout(pollForProductPayment, 2000)

        } else {
          // Fallback to legacy processing logic
          setStatusMessage('Processing your order...')
          
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
            setPaymentStatus('success')
            setTimeout(() => {
              router.push(`/checkout/${sessionId}/complete`)
            }, 2000)
          } else {
            throw new Error(result.error || 'Payment completion failed')
          }
        }

      } catch (error) {
        console.error('Error checking payment status:', error)
        setPaymentStatus('failed')
        setStatusMessage('An error occurred while processing your payment.')
        setProcessingError(error instanceof Error ? error.message : 'Payment processing failed')
      }
    }

    checkPaymentStatus()
  }, [sessionId, transactionId, type, router])

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
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
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
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Processing Text */}
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          {paymentStatus === 'processing' ? 'Processing your order...' : 
           paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        <p className="text-neutral-600 mb-6">{statusMessage}</p>

        {/* Success/Failed indicators */}
        {paymentStatus === 'success' && (
          <div className="mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 text-sm">Redirecting you to the confirmation page...</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-6">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/checkout/${sessionId}/payment`)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/support')}
                className="px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 ml-3"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
        
        {/* Order Summary */}
        {session && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-neutral-800 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Items ({session.cart_items.length})</span>
                <span>LKR {session.cart_total.toLocaleString()}</span>
              </div>
              {session.cart_items.map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>{`Product ${item.product_id.slice(-8)}`} × {item.quantity}</span>
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
        )}

        {/* Transaction details */}
        {(transactionId || orderId) && (
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="text-xs text-neutral-500 space-y-1">
              {transactionId && (
                <p>Transaction ID: {transactionId}</p>
              )}
              {orderId && (
                <p>Order ID: {orderId}</p>
              )}
              {type && (
                <p>Payment Type: {type === 'consultation' ? 'Consultation Payment' : 'Product Payment'}</p>
              )}
            </div>
          </div>
        )}

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