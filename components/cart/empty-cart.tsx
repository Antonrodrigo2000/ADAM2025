"use client"

import type React from "react"
import { ShoppingCart } from "lucide-react"

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <ShoppingCart className="h-16 w-16 mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
      <p className="text-sm text-gray-500 mt-1">Add some products to get started</p>
    </div>
  )
}