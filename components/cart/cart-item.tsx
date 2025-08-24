"use client"

import type React from "react"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface CartItemData {
  id: string
  productId: string
  productName: string
  variantName: string
  image?: string
  totalPrice: number
  monthlyPrice: number
  months: number
  quantity: number
  prescriptionRequired: boolean
  consultationFee: number
}

interface CartItemProps {
  item: CartItemData
  onQuantityChange: (itemId: string, newQuantity: number) => void
  onRemove: (itemId: string) => void
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex space-x-4">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
          {item.productName}
        </h4>
        <p className="text-sm text-gray-500">{item.variantName}</p>
        <div className="mt-1 flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            LKR {item.totalPrice.toLocaleString()}
          </span>
          {item.months > 1 && (
            <span className="text-xs text-gray-500">
              (LKR {item.monthlyPrice.toLocaleString()}/month)
            </span>
          )}
        </div>
        {item.prescriptionRequired && (
          <p className="text-xs text-blue-600 mt-1">
            Consultation required
          </p>
        )}

        {/* Quantity Controls */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              className="h-8 w-8 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-base font-semibold w-8 text-center text-gray-900">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="h-8 w-8 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}