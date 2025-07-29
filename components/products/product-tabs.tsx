"use client"

import { useState } from "react"
import type { Product, Review } from "@/types/product"
import { Star, CheckCircle } from "lucide-react"

interface ProductTabsProps {
  product: Product
}

// Sample reviews data
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
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Benefits */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h3>
              <ul className="space-y-3">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How it Works */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How it Works</h3>
              <p className="text-gray-700 leading-relaxed">{product.how_it_works}</p>
            </div>

            {/* Expected Timeline */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Expected Timeline</h3>
              <p className="text-gray-700 leading-relaxed">{product.expected_timeline}</p>
            </div>
          </div>
        )}

        {activeTab === "ingredients" && (
          <div className="space-y-8">
            {/* Active Ingredients */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Ingredients</h3>
              <div className="space-y-4">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{ingredient.name}</h4>
                      <span className="text-sm font-medium text-blue-600">{ingredient.dosage}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{ingredient.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Studies */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Clinical Studies</h3>
              <div className="space-y-4">
                {product.clinical_studies.map((study, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{study.title}</h4>
                    <p className="text-gray-700 text-sm mb-3">{study.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efficacy Rate:</span>
                      <span className="font-semibold text-green-600">{study.efficacy_rate}%</span>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Possible Side Effects</h3>
              <ul className="space-y-2">
                {product.side_effects.map((effect, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{effect}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contraindications */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contraindications</h3>
              <ul className="space-y-2">
                {product.contraindications.map((contraindication, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{contraindication}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Warnings</h3>
              <ul className="space-y-2">
                {product.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Reviews Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl font-bold text-gray-900">{product.rating}</div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Based on {product.review_count.toLocaleString()} reviews</div>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {sampleReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{review.user_name}</span>
                        {review.verified_purchase && (
                          <span className="inline-flex items-center space-x-1 text-xs text-green-600">
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
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {product.faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">{faq.question}</span>
                <span className="text-gray-500 group-open:rotate-180 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="p-4 text-gray-700 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
