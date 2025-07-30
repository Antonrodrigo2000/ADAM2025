"use client"

import { useState } from "react"
import type { Product } from "@/types/product"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  const quantityOptions = [
    { months: 1, price: product.price, savings: 0, label: "1 Month Supply" },
    { months: 3, price: product.price * 3 * 0.9, savings: 10, label: "3 Month Supply" },
    { months: 6, price: product.price * 6 * 0.8, savings: 20, label: "6 Month Supply" },
  ]

  const selectedOption = quantityOptions[selectedQuantity - 1] || quantityOptions[0]
  const monthlyPrice = selectedOption.price / selectedOption.months
  const totalFirstOrder = selectedOption.price + product.consultation_fee

  return (
    <div className="sticky top-24 space-y-6">
      {/* Product Header */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_12px_24px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.9)]">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>{product.health_vertical.name}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

        {/* Trust Elements - Simple Text */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>Licensed physicians</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <span>Discreet packaging</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <span>2-day consultation SLA</span>
          </div>
        </div>

        {/* Prescription Badge */}
        {product.prescription_required && (
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-4 h-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>Prescription Required</span>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Product price:</span>
            <span className="font-semibold">LKR {monthlyPrice.toLocaleString()}/month</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Consultation fee:</span>
            <span className="font-semibold">LKR {product.consultation_fee.toLocaleString()} (one-time)</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total first order:</span>
              <span className="text-xl font-bold text-blue-600">LKR {totalFirstOrder.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose your supply</h3>
          <div className="grid gap-3">
            {quantityOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedQuantity(option.months)}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                  selectedQuantity === option.months
                    ? "border-blue-500 bg-blue-50 shadow-[inset_0_4px_8px_rgba(59,130,246,0.1)]"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-[0_4px_8px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">
                      LKR {(option.price / option.months).toLocaleString()}/month
                    </div>
                  </div>
                  {option.savings > 0 && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
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
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-[0_8px_16px_rgba(59,130,246,0.3),inset_0_1px_2px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_20px_rgba(59,130,246,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:shadow-[inset_0_4px_8px_rgba(59,130,246,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
            Add to Cart
          </button>

          {product.prescription_required && (
            <button className="w-full bg-white text-gray-700 py-4 px-6 rounded-2xl font-semibold border border-gray-300 shadow-[0_4px_8px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.8)] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
              Book Consultation First
            </button>
          )}
        </div>
      </div>

      {/* Medical Information Panel */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_12px_24px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.9)]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Active Ingredient</h4>
            <p className="text-gray-600">{product.active_ingredient}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Dosage Instructions</h4>
            <p className="text-gray-600">{product.dosage}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">How it works</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{product.how_it_works}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
