"use client"

import { useState } from "react"
import { Star, CheckCircle } from "lucide-react"
import type { Product } from "@/types/product"

interface ProductTabsProps {
  product: Product
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ingredients", label: "Ingredients" },
    { id: "safety", label: "Safety" },
    { id: "reviews", label: "Reviews" },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-16">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
          <div className="space-y-8">
            {/* Benefits */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How it Works */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How it Works</h3>
              <p className="text-gray-700 leading-relaxed">{product.how_it_works}</p>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expected Timeline</h3>
              <p className="text-gray-700 leading-relaxed">{product.expected_timeline}</p>
            </div>
          </div>
        )}

        {activeTab === "ingredients" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Ingredient</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{product.active_ingredient}</span>
                  <span className="text-sm text-gray-600">{product.dosage}</span>
                </div>
                <p className="text-gray-700 text-sm">
                  The primary active ingredient responsible for the therapeutic effects of this medication.
                </p>
              </div>
            </div>

            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Ingredient List</h3>
                <div className="space-y-3">
                  {product.ingredients.map((ingredient, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{ingredient.name}</span>
                        <span className="text-sm text-gray-600">{ingredient.dosage}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{ingredient.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "safety" && (
          <div className="space-y-8">
            {/* Side Effects */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Possible Side Effects</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {product.side_effects.map((effect, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{effect}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contraindications */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Who Should Not Use This</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {product.contraindications.map((contraindication, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{contraindication}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Warnings */}
            {product.warnings && product.warnings.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Warnings</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {product.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Review Summary */}
            <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{product.rating}</div>
                <div className="flex items-center justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">{product.review_count} reviews</div>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {product.reviews &&
                product.reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{review.author}</span>
                          {review.verified_purchase && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.created_at}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
