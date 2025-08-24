'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state: cartState } = useCart()
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkoutError = searchParams.get('checkout_error')
    if (checkoutError) {
      setError(checkoutError)
    }
  }, [searchParams])

  useEffect(() => {
    // Auto-create session if cart has items
    if (cartState.items.length > 0 && !isCreatingSession && !error) {
      handleCreateSession()
    }
  }, [cartState.items.length, isCreatingSession, error])

  const handleCreateSession = async () => {
    if (cartState.items.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsCreatingSession(true)
    // Only clear error when user manually retries, not on auto-creation
    if (error) {
      setError(null)
    }

    try {
      // Format cart items for checkout session
      const cartItems = cartState.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.totalPrice,
      }))

      // Create checkout session
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_items: cartItems,
          source: 'checkout_page',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Navigate to checkout session
        router.push(data.redirect_url)
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      setError(error instanceof Error ? error.message : 'Failed to create checkout session')
    } finally {
      setIsCreatingSession(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <div className="neomorphic-container p-8 text-center">
          {isCreatingSession ? (
            <>
              {/* Loading State */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-neutral-800 mb-2">Setting up your checkout...</h2>
              <p className="text-neutral-600">Please wait while we prepare your secure checkout session.</p>
            </>
          ) : error ? (
            <>
              {/* Error State */}
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Checkout Error</h2>
              <p className="text-neutral-600 mb-6">{error}</p>
              
              <div className="space-y-3">
                {cartState.items.length > 0 ? (
                  <Button 
                    onClick={handleCreateSession}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isCreatingSession}
                  >
                    Try Again
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push('/products')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Browse Products
                  </Button>
                )}
                
                <Button 
                  onClick={() => router.push('/cart')}
                  variant="outline"
                  className="w-full"
                >
                  View Cart
                </Button>
              </div>
            </>
          ) : cartState.items.length === 0 ? (
            <>
              {/* Empty Cart State */}
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M7 13l2.5-2.5m0 0h8M9.5 10.5L12 8l2.5 2.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-800 mb-2">Your cart is empty</h2>
              <p className="text-neutral-600 mb-6">Add some products to your cart to proceed with checkout.</p>
              
              <Button 
                onClick={() => router.push('/products')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Browse Products
              </Button>
            </>
          ) : (
            <>
              {/* Manual Creation State */}
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-800 mb-2">Ready to checkout?</h2>
              <p className="text-neutral-600 mb-6">
                You have {cartState.items.length} item{cartState.items.length !== 1 ? 's' : ''} in your cart 
                (LKR {cartState.total.toLocaleString()}).
              </p>
              
              <Button 
                onClick={handleCreateSession}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isCreatingSession}
              >
                Start Checkout
              </Button>
            </>
          )}
        </div>

        {/* Cart Summary (if has items) */}
        {cartState.items.length > 0 && !isCreatingSession && (
          <div className="neomorphic-container p-4 mt-4">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Cart Summary</h3>
            <div className="space-y-2 text-sm">
              {cartState.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-neutral-600">{item.productName} × {item.quantity}</span>
                  <span className="text-neutral-800">LKR {item.totalPrice.toLocaleString()}</span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>LKR {cartState.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
