"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

interface PaymentResult {
  success: boolean
  orderRef?: string
  paymentToken?: string
  transactionId?: string
  amount?: number
  currency?: string
  message?: string
  error?: string
}

export default function PaymentReturnPage() {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { actions: cartActions } = useCart()

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Get payment parameters from URL
        const token = searchParams.get('token')
        const status = searchParams.get('status')
        const orderRef = searchParams.get('orderRef')
        const transactionId = searchParams.get('transactionId')

        if (!token || !status || !orderRef) {
          setPaymentResult({
            success: false,
            error: 'Invalid payment return data'
          })
          return
        }

        console.log('Processing payment return:', { token, status, orderRef, transactionId })

        // Verify payment with backend
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            status,
            orderRef,
            transactionId
          }),
        })

        const result = await response.json()

        if (result.success) {
          // Payment successful - create order and clear cart
          await createOrder(result)
          cartActions.clearCart()
          cartActions.clearCheckoutData()
          
          setPaymentResult({
            success: true,
            orderRef: result.orderRef,
            transactionId: result.transactionId,
            amount: result.amount,
            currency: result.currency,
            message: 'Payment completed successfully!'
          })

          // Redirect to success page after 3 seconds
          setTimeout(() => {
            router.push('/payment/success')
          }, 3000)
        } else {
          setPaymentResult({
            success: false,
            error: result.error || 'Payment verification failed'
          })
        }

      } catch (error) {
        console.error('Payment return processing error:', error)
        setPaymentResult({
          success: false,
          error: 'Failed to process payment return'
        })
      } finally {
        setIsProcessing(false)
      }
    }

    processPaymentReturn()
  }, [searchParams, router, cartActions])

  const createOrder = async (paymentData: any) => {
    try {
      const checkoutData = cartActions.getCheckoutData()
      if (!checkoutData) {
        throw new Error('Checkout data not found')
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing')
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // Create order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: paymentData.userId,
          health_vertical_id: '1', // Hair loss vertical
          status: 'pending',
          total_amount: paymentData.amount / 100, // Convert from cents
          delivery_address: checkoutData.deliveryAddress,
          metadata: {
            payment_token: paymentData.token,
            transaction_id: paymentData.transactionId,
            order_ref: paymentData.orderRef,
            checkout_data: checkoutData
          }
        })
        .select()
        .single()

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      console.log('Order created successfully:', orderData.id)

    } catch (error) {
      console.error('Order creation error:', error)
      // Don't throw here as payment was successful - log for manual processing
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {paymentResult?.success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-4">{paymentResult.message}</p>
              
              {paymentResult.orderRef && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Order Reference</p>
                  <p className="font-mono text-sm text-gray-900">{paymentResult.orderRef}</p>
                </div>
              )}
              
              {paymentResult.amount && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {paymentResult.currency} {paymentResult.amount.toLocaleString()}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Redirecting to order confirmation...
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">{paymentResult?.error}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Return Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}