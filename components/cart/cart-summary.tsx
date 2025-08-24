"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { calculateOrderTotals, formatPrice } from "@/components/checkout/order-summary/calculations"
import type { CartItem } from "@/components/checkout/order-summary/types"

interface CartSummaryProps {
  items: any[] // Cart items from context
  onCheckout: () => void
  onContinueShopping: () => void
  isLoading?: boolean
}

export function CartSummary({ items, onCheckout, onContinueShopping, isLoading }: CartSummaryProps) {
  // Convert cart items to calculation format
  const calculationItems: CartItem[] = items.map(item => ({
    product_id: item.productId || item.id,
    quantity: item.quantity,
    price: item.totalPrice || item.price,
    productName: item.productName,
    variantName: item.variantName,
    image: item.image,
    monthlyPrice: item.monthlyPrice,
    months: item.months,
    consultationRequired: item.consultationRequired,
    consultationFee: item.consultationFee
  }))

  const calculation = calculateOrderTotals(calculationItems)

  if (items.length === 0) return null

  return (
    <div className="px-6 pt-4 pb-6 bg-gray-50 border-t border-gray-200">
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(calculation.subtotal)}</span>
        </div>

        {/* Consultation Fee */}
        {calculation.hasConsultationItems && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Consultation fee</span>
            <span className="font-medium">{formatPrice(calculation.consultationFee)}</span>
          </div>
        )}

        {/* Delivery Fee */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery</span>
          <span className="font-medium">
            {calculation.deliveryFee === 0 ? 'FREE' : formatPrice(calculation.deliveryFee)}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(calculation.total)}</span>
          </div>
        </div>

        {/* Consultation Note */}
        {calculation.hasConsultationItems && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
            <strong>Note:</strong> Consultation fee covers all prescription items in your order.
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <div className="mt-6">
        <Button
          onClick={onCheckout}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </div>

      {/* Continue Shopping */}
      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          onClick={onContinueShopping}
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}