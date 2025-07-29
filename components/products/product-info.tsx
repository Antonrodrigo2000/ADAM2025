"use client"

import { useState } from "react"
import type { Product } from "@/types/product"
import { Star, Shield, Package } from "lucide-react"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const quantityOptions = [
    { months: 1, price: product.price, savings: 0, label: "1 Month Supply" },
    { months: 3, price: product.price * 0.95, savings: 5, label: "3 Month Supply" },
    { months: 6, price: product.price * 0.9, savings: 10, label: "6 Month Supply" },
  ]

  const selectedOption = quantityOptions[selectedQuantity - 1]
  const totalPrice = selectedOption.price * selectedOption.months
  const firstOrderTotal = totalPrice + (product.prescription_required ? product.consultation_fee : 0)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAddingToCart(false)
    // Handle cart addition logic here
  }

  return (
    <div className="sticky top-8 space-y-6">
      {/* Product Title & Rating */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900">{product.rating}</span>
          <span className="text-sm text-gray-600">({product.review_count.toLocaleString()} reviews)</span>
        </div>
      </div>

      {/* Prescription Badge */}
      {product.prescription_required && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Prescription Required</span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Price Breakdown</h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Product price:</span>
            <span className="font-medium">LKR {selectedOption.price.toLocaleString()}/month</span>
          </div>

          {product.prescription_required && (
            <div className="flex justify-between">
              <span className="text-gray-600">Consultation fee:</span>
              <span className="font-medium">LKR {product.consultation_fee.toLocaleString()} (one-time)</span>
            </div>
          )}

          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total first order:</span>
              <span className="text-blue-600">LKR {firstOrderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Select Quantity</h3>
        <div className="grid gap-3">
          {quantityOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedQuantity(index + 1)}
              className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                selectedQuantity === index + 1 ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">LKR {(option.price * option.months).toLocaleString()}</div>
                </div>
                {option.savings > 0 && (
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Save {option.savings}%
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200"
        >
          {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
        </button>

        {product.prescription_required && (
          <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-4 px-6 rounded-xl transition-colors duration-200">
            Book Consultation First
          </button>
        )}
      </div>

      {/* Delivery Info */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <Package className="w-5 h-5 text-gray-600" />
        <div className="text-sm">
          <div className="font-medium text-gray-900">Free delivery</div>
          <div className="text-gray-600">2-3 business days</div>
        </div>
      </div>
    </div>
  )
}
