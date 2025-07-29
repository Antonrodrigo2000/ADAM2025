"use client"

import { useState } from "react"
import type { Product, ProductReview } from "@/types/product"
import { Star, CheckCircle } from "lucide-react"

interface ProductTabsProps {
  product: Product
}

// Mock reviews data
const mockReviews: ProductReview[] = [
  {
    id: "1",
    user_name: "Kamal P.",
    rating: 5,
    comment: "Great results after 4 months of use. Highly recommend!",
    verified_purchase: true,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    user_name: "Nimal S.",
    rating: 4,
    comment: "Good product, saw some improvement. Takes patience but works.",
    verified_purchase: true,
    created_at: "2024-01-10",
  },
]

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ingredients", label: "Ingredients" },
    { id: "safety", label: "Safety" },
    { id: "reviews", label: "Reviews" },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-16">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works</h3>
              <p className="text-gray-700">{product.how_it_works}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Expected timeline</h3>
              <p className="text-gray-700">{product.expected_timeline}</p>
            </div>

            {product.clinical_studies && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical efficacy</h3>
                <p className="text-gray-700">{product.clinical_studies}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "ingredients" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active ingredients</h3>
              <div className="space-y-4">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                      <span className="text-sm font-medium text-blue-600">{ingredient.dosage}</span>
                    </div>
                    <p className="text-sm text-gray-600">{ingredient.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dosage instructions</h3>
              <p className="text-gray-700">{product.dosage}</p>
            </div>
          </div>
        )}

        {activeTab === "safety" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Possible side effects</h3>
              <ul className="space-y-2">
                {product.side_effects.map((effect, index) => (
                  <li key={index} className="text-gray-700">
                    • {effect}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contraindications</h3>
              <ul className="space-y-2">
                {product.contraindications.map((contraindication, index) => (
                  <li key={index} className="text-gray-700">
                    • {contraindication}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Important warnings</h3>
              <ul className="space-y-2">
                {product.warnings.map((warning, index) => (
                  <li key={index} className="text-gray-700">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
              <div className="flex items-center space-x-2">
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
                <span className="text-sm text-gray-600">
                  {product.rating} out of 5 ({product.review_count.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{review.user_name}</span>
                      {review.verified_purchase && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-sm text-gray-500 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
