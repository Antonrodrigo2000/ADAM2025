"use client"

import { useState } from "react"
import type { Product } from "@/types/product"
import { Star, Shield, Clock, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const quantityOptions = [
    { months: 1, price: product.price, savings: 0, label: "1 Month Supply" },
    { months: 3, price: product.price * 3 * 0.9, savings: 10, label: "3 Month Supply" },
    { months: 6, price: product.price * 6 * 0.8, savings: 20, label: "6 Month Supply" },
  ]

  const selectedOption = quantityOptions[selectedQuantity - 1] || quantityOptions[0]
  const monthlyPrice = selectedOption.price / selectedOption.months
  const totalFirstOrder = selectedOption.price + (product.prescription_required ? product.consultation_fee : 0)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAddingToCart(false)
    // Handle cart logic here
  }

  return (
    <div className="space-y-6">
      {/* Product Title & Category */}
      <div>
        <div className="text-sm text-blue-600 font-medium mb-2">{product.health_vertical.name}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {/* Rating & Reviews */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
          ))}
          <span className="text-sm font-medium text-gray-900 ml-2">{product.rating}</span>
        </div>
        <div className="text-sm text-gray-600">({product.review_count.toLocaleString()} reviews)</div>
      </div>

      {/* Prescription Badge */}
      {product.prescription_required && (
        <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Prescription Required - Consultation Needed</span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Product price:</span>
          <span className="font-semibold">LKR {monthlyPrice.toLocaleString()}/month</span>
        </div>
        {product.prescription_required && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Consultation fee:</span>
            <span className="font-semibold">LKR {product.consultation_fee.toLocaleString()} (one-time)</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total first order:</span>
            <span className="text-xl font-bold text-blue-600">LKR {totalFirstOrder.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">Select Quantity:</label>
        <div className="grid grid-cols-1 gap-3">
          {quantityOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedQuantity(index + 1)}
              className={`relative p-4 border-2 rounded-lg text-left transition-colors ${
                selectedQuantity === index + 1 ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">
                    LKR {(option.price / option.months).toLocaleString()}/month
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">LKR {option.price.toLocaleString()}</div>
                  {option.savings > 0 && (
                    <div className="text-sm text-green-600 font-medium">Save {option.savings}%</div>
                  )}
                </div>
              </div>
              {option.savings > 0 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  SAVE {option.savings}%
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
        >
          {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
        </Button>

        {product.prescription_required && (
          <Button
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3 bg-transparent"
          >
            Book Consultation First
          </Button>
        )}
      </div>

      {/* Delivery Info */}
      <div className="flex items-center space-x-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4" />
          <span>Free delivery</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>2-3 day delivery</span>
        </div>
      </div>
    </div>
  )
}
