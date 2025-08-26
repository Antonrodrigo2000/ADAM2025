"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { CartPageHeader } from "./cart-page-header"
import { CartItem } from "./cart-item"
import { CartSummary } from "./cart-summary"
import { EmptyCartPage } from "./empty-cart-page"

export function CartContent() {
  const router = useRouter()
  const { state, actions } = useCart()
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      actions.removeItem(itemId)
    } else {
      actions.updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    actions.removeItem(itemId)
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      // Format cart items for checkout session
      const cartItems = state.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.totalPrice,
        productName: item.productName,
        variantName: item.variantName,
        image: item.image,
        monthlyPrice: item.monthlyPrice,
        months: item.months,
        consultationRequired: item.consultationRequired,
        consultationFee: item.consultationFee,
      }))

      // Create checkout session
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_items: cartItems,
          source: 'cart_page',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Navigate to checkout session
        window.location.href = data.redirect_url
      } else {
        console.error('Failed to create checkout session:', data.error)
        // Fallback to old checkout flow
        router.push('/checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setIsCheckingOut(false)
      // Fallback to old checkout flow
      router.push('/checkout')
    }
  }

  const handleContinueShopping = () => {
    router.push('/products')
  }

  // Empty cart state
  if (state.items.length === 0) {
    return <EmptyCartPage />
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <CartPageHeader itemCount={state.items.length} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {state.items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <CartItem
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg sticky top-24">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Order Summary</h3>
            </div>
            <CartSummary
              items={state.items}
              onCheckout={handleCheckout}
              onContinueShopping={handleContinueShopping}
              isLoading={isCheckingOut}
            />
          </div>
        </div>
      </div>
    </div>
  )
}