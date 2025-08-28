'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { ProcessingStatus } from '@/components/checkout/processing-status'
import { TransactionReference } from '@/components/checkout/transaction-reference'
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

  const type = searchParams.get('type') // 'consultation' or 'upfront'
  const transactionId = searchParams.get('tx')

  useEffect(() => {
    console.log('🚀 Processing page useEffect triggered:', { sessionId, transactionId, type })
    if (!sessionId) {
      console.log('❌ Missing sessionId:', { sessionId })
      return
    }

    // If no transactionId yet, wait for the payment API to complete and populate it
    if (!transactionId) {
      console.log('⏳ Waiting for payment API to complete and provide transactionId...')
      setStatusMessage('Initiating your payment...')
      return
    }

    console.log('✅ Starting payment status check for type:', type)
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
            console.log(`🔍 Looking for order with consultation_payment_id: ${transactionId}`)
            const { data: order, error } = await supabase
              .from('orders')
              .select('id, status, consultation_status, payment_status, consultation_payment_id')
              .eq('consultation_payment_id', transactionId)
              .single()

            if (error) {
              console.log('❌ Query error:', error)
            }

            if (order) {
              console.log('✅ Order found:', order)
              setOrderId(order.id)
              
              if (order.consultation_status === 'paid') {
                setPaymentStatus('success')
                setStatusMessage('Consultation payment successful! Your order is being reviewed by our medical team.')
                
                // Update session to completed status since consultation flow is done
                try {
                  await supabase
                    .from('checkout_sessions')
                    .update({
                      status: 'completed',
                      current_step: 'processing', // Keep processing step but mark as completed
                      completed_at: new Date().toISOString()
                    })
                    .eq('session_token', sessionId)
                  
                  console.log('✅ Session updated to completed status for consultation')
                } catch (error) {
                  console.error('❌ Failed to update session status:', error)
                }
                
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

        } else if (type === 'upfront') {
          // Check for upfront payment confirmation via webhook
          setStatusMessage('Processing upfront payment...')
          
          let attempts = 0
          const maxAttempts = 30 // 30 seconds timeout
          
          const pollForUpfrontPayment = async (): Promise<void> => {
            attempts++
            console.log(`🔍 Polling for upfront payment confirmation, attempt ${attempts}/${maxAttempts}`)

            // Look for order with matching genie_transaction_id (set by webhook)
            const { data: order, error } = await supabase
              .from('orders')
              .select('id, status, payment_status, genie_transaction_id, payment_flow_type')
              .eq('genie_transaction_id', transactionId)
              .eq('payment_flow_type', 'full_upfront')
              .single()

            if (error) {
              console.log('❌ Query error:', error)
            }

            if (order) {
              console.log('✅ Upfront payment order found:', order)
              setOrderId(order.id)
              
              if (order.payment_status === 'confirmed' && order.status === 'processing') {
                setPaymentStatus('success')
                setStatusMessage('Payment successful! Your order is being processed and will be shipped soon.')
                
                // Update session to completed status
                try {
                  await supabase
                    .from('checkout_sessions')
                    .update({
                      status: 'completed',
                      current_step: 'processing',
                      completed_at: new Date().toISOString()
                    })
                    .eq('session_token', sessionId)
                  
                  console.log('✅ Session updated to completed status for upfront payment')
                } catch (error) {
                  console.error('❌ Failed to update session status:', error)
                }
                
                // Redirect to success page after 3 seconds
                setTimeout(() => {
                  router.push(`/checkout/${sessionId}/complete?order=${order.id}&type=upfront`)
                }, 3000)
                return
              } else if (order.status === 'payment_failed' || order.payment_status === 'failed') {
                setPaymentStatus('failed')
                setStatusMessage('Upfront payment failed. Please try again.')
                setProcessingError('Upfront payment failed')
                return
              } else if (order.status === 'cancelled' || order.payment_status === 'cancelled') {
                setPaymentStatus('failed')
                setStatusMessage('Payment was cancelled. Please try again.')
                setProcessingError('Payment cancelled')
                return
              }
            }

            if (attempts < maxAttempts) {
              setTimeout(pollForUpfrontPayment, 1000) // Poll every second
            } else {
              setPaymentStatus('failed')
              setStatusMessage('Payment processing timeout. Please contact support if your payment was charged.')
              setProcessingError('Payment processing timeout - webhook may have failed')
            }
          }

          // Start polling after a short delay
          setTimeout(pollForUpfrontPayment, 2000)

        } else {
          // Unknown payment type - show error
          console.error('❌ Unknown payment type:', type, 'Expected: consultation or upfront')
          setPaymentStatus('failed')
          setStatusMessage('Invalid payment type. Please contact support.')
          setProcessingError(`Unknown payment type: ${type}`)
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <CheckoutProgressIndicator 
        currentStep="processing" 
        isAuthenticated={!!session.user_id} 
      />

      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mt-6">
        <div className="text-center">
          <ProcessingStatus
            status={paymentStatus}
            message={statusMessage}
            onRetry={() => router.push(`/checkout/${sessionId}/payment`)}
            onSupport={() => router.push('/support')}
          />
        </div>

        <TransactionReference
          orderId={orderId ?? undefined}
          transactionId={transactionId ?? undefined}
        />

      </div>
    </div>
  )
}

function ProcessingLoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mt-6">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-6"></div>
          <div className="h-6 bg-neutral-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-64 mx-auto mb-8"></div>
        </div>
      </div>
    </div>
  )
}