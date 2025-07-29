"use client"

import { useState } from "react"
import type { Product, Review } from "@/types/product"
import { Star, CheckCircle } from "lucide-react"

interface ProductTabsProps {
  product: Product
}

const sampleReviews: Review[] = [
  {
    id: "1",
    user_name: "Rajesh K.",
    rating: 5,
    comment:
      "Excellent results after 4 months of use. Hair growth is visible and I'm very satisfied with the product quality.",
    verified_purchase: true,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    user_name: "Pradeep S.",
    rating: 4,
    comment: "Good product, saw results after 3 months. Delivery was quick and packaging was discreet.",
    verified_purchase: true,
    created_at: "2024-01-10",
  },
  {
    id: "3",
    user_name: "Chaminda L.",
    rating: 5,
    comment: "Been using for 6 months now. Significant improvement in hair density. Highly recommend!",
    verified_purchase: true,
    created_at: "2024-01-05",
  },
]

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ingredients", label: "Ingredients" },
    { id: "safety", label: "Safety" },
    { id: "reviews", label: "Reviews" },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation - Neumorphic */}
      <div className="bg-gray-100 rounded-3xl p-2 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)] mb-8">
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 font-medium text-sm rounded-2xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]"
                  : "text-gray-600 hover:text-gray-800 hover:shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.9)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - Neumorphic Container */}
      <div className="bg-gray-100 rounded-3xl p-8 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]">
        <div className="space-y-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Benefits */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Benefits</h3>
                <div className="space-y-4">
                  {product.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 bg-white rounded-2xl p-4 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)] flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it Works */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">How it Works</h3>
                <div className="bg-white rounded-2xl p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]">
                  <p className="text-gray-700 leading-relaxed">{product.how_it_works}</p>
                </div>
              </div>

              {/* Expected Timeline */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Expected Timeline</h3>
                <div className="bg-white rounded-2xl p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]">
                  <p className="text-gray-700 leading-relaxed">{product.expected_timeline}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="space-y-8">
              {/* Active Ingredients */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Active Ingredients</h3>
                <div className="space-y-4">
                  {product.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900">{ingredient.name}</h4>
                        <span className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
                          {ingredient.dosage}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{ingredient.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Studies */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Clinical Studies</h3>
                <div className="space-y-4">
                  {product.clinical_studies.map((study, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-blue-100/50"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{study.title}</h4>
                      <p className="text-gray-700 text-sm mb-4">{study.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Efficacy Rate:</span>
                        <span className="bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
                          {study.efficacy_rate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "safety" && (
            <div className="space-y-8">
              {/* Side Effects */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Possible Side Effects</h3>
                <div className="bg-yellow-50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-yellow-100/50">
                  <ul className="space-y-3">
                    {product.side_effects.map((effect, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0 shadow-[1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                        <span className="text-gray-700">{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contraindications */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Contraindications</h3>
                <div className="bg-red-50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-red-100/50">
                  <ul className="space-y-3">
                    {product.contraindications.map((contraindication, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0 shadow-[1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                        <span className="text-gray-700">{contraindication}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Warnings */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Important Warnings</h3>
                <div className="bg-orange-50 rounded-2xl p-6 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-orange-100/50">
                  <ul className="space-y-3">
                    {product.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0 shadow-[1px_1px_2px_rgba(0,0,0,0.2)]"></div>
                        <span className="text-gray-700">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Reviews Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]">
                <div className="flex items-center space-x-6 mb-4">
                  <div className="text-4xl font-bold text-gray-900">{product.rating}</div>
                  <div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Based on {product.review_count.toLocaleString()} reviews
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {sampleReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl p-6 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-gray-900">{review.user_name}</span>
                          {review.verified_purchase && (
                            <span className="inline-flex items-center space-x-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified Purchase</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 pt-8 border-t border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {product.faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex justify-between items-center cursor-pointer p-4 bg-white rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.95)] transition-all duration-300">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 p-4 bg-gray-50 rounded-2xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.9)] text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
