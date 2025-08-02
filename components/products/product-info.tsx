"use client"

import { useState } from "react"
import type { Product } from "@/types/product"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const quantityOptions = [
    { months: 1, price: product.price, savings: 0, label: "1 Month Supply" },
    { months: 3, price: product.price * 3 * 0.9, savings: 10, label: "3 Month Supply" },
  ]

  const selectedOption = quantityOptions[selectedQuantity - 1] || quantityOptions[0]
  const monthlyPrice = selectedOption.price / selectedOption.months
  const totalFirstOrder = selectedOption.price + (product.prescription_required ? product.consultation_fee : 0)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAddingToCart(false)
  }

  return (
    <div className="space-y-6">
      {/* Product Title & Category - Neumorphic Card */}
      <div className="bg-gray-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]">
        <div className="text-sm text-blue-600 font-medium mb-2">{product.health_vertical.name}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {/* Trust Elements - Simple Text */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Licensed physicians</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>Discreet packaging</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>2-day consultation SLA</span>
        </div>
      </div>

      {/* Prescription Badge - Neumorphic */}
      {product.prescription_required && (
        <div className="bg-blue-50 rounded-2xl p-4 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-blue-100/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-800">Prescription Required - Consultation Needed</span>
          </div>
        </div>
      )}

      {/* Price Breakdown - Neumorphic Card */}
      <div className="bg-gray-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]">
        <div className="space-y-4">
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
          <div className="border-t border-gray-200/50 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total first order:</span>
              <span className="text-xl font-bold text-blue-600">LKR {totalFirstOrder.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quantity Selector - Neumorphic Cards */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-900">Select Quantity:</label>
        <div className="grid grid-cols-1 gap-4">
          {quantityOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedQuantity(index + 1)}
              className={`relative p-5 bg-gray-100 rounded-2xl text-left transition-all duration-300 ${
                selectedQuantity === index + 1
                  ? "shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] border border-blue-200/50"
                  : "shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9)]"
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
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-[4px_4px_8px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(255,255,255,0.1)]">
                  SAVE {option.savings}%
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons - Neumorphic */}
      <div className="space-y-4">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.1)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.25),-4px_-4px_8px_rgba(255,255,255,0.15)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]"
        >
          {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
        </button>

        {product.prescription_required && (
          <button className="w-full bg-gray-100 text-blue-600 hover:text-blue-700 py-4 font-semibold rounded-2xl transition-all duration-300 shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
            Book Consultation First
          </button>
        )}
      </div>

      {/* Delivery Info - Neumorphic Card */}
      <div className="bg-gray-100 rounded-2xl p-4 shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)]">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span>Doorstep delivery</span>
            </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span>2-3 day delivery</span>
          </div>
        </div>
      </div>
    </div>
  )
}
