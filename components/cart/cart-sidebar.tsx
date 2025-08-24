"use client"

import type React from "react"
import { X } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CartItem } from './cart-item'
import { CartSummary } from './cart-summary'
import { EmptyCart } from './empty-cart'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state, actions } = useCart()

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
          source: 'cart_sidebar',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Navigate to checkout session
        window.location.href = data.redirect_url
      } else {
        console.error('Failed to create checkout session:', data.error)
        // Fallback to old checkout flow
        window.location.href = '/checkout'
      }
    } catch (error) {
      console.error('Checkout error:', error)
      // Fallback to old checkout flow
      window.location.href = '/checkout'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-gray-200 pb-4 pt-6 px-6">
          <SheetTitle className="text-left">
            Shopping Cart ({state.items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {state.items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="space-y-6">
              {state.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout */}
        <CartSummary
          items={state.items}
          onCheckout={handleCheckout}
          onContinueShopping={onClose}
          isLoading={state.isLoading}
        />
      </SheetContent>
    </Sheet>
  )
}