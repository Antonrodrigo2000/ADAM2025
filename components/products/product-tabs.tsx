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
    comment: "Excellent results after 4 months of use. Hair growth is noticeable and the product is easy to apply.",
    verified_purchase: true,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    user_name: "Pradeep S.",
    rating: 4,
    comment: "Good product, saw results after 3 months. Slight scalp irritation initially but it went away.",
    verified_purchase: true,
    created_at: "2024-01-10",
  },
  {
    id: "3",
    user_name: "Chaminda P.",
    rating: 5,
    comment: "Very satisfied with the results. Professional packaging and fast delivery.",
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
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Benefits</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">How It Works</h3>
              <p className="text-gray-700 leading-relaxed">{product.how_it_works}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Expected Timeline</h3>
              <p className="text-gray-700 leading-relaxed">{product.expected_timeline}</p>
            </div>
          </div>
        )}

        {activeTab === "ingredients" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-6">Active Ingredients</h3>
              <div className="space-y-4">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{ingredient.name}</h4>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {ingredient.dosage}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{ingredient.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Clinical Studies</h3>
              <div className="space-y-4">
                {product.clinical_studies.map((study, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{study.title}</h4>
                    <p className="text-gray-700 text-sm mb-2">{study.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">{study.efficacy_rate}% efficacy rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "safety" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-600">Side Effects</h3>
              <ul className="space-y-2">
                {product.side_effects.map((effect, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{effect}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-600">Contraindications</h3>
              <ul className="space-y-2">
                {product.contraindications.map((contraindication, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{contraindication}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-yellow-600">Warnings</h3>
              <ul className="space-y-2">
                {product.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating} out of 5</span>
                <span className="text-gray-600">({product.review_count} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              {sampleReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{review.user_name}</span>
                      {review.verified_purchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="border-t border-gray-200 p-8">
        <h3 className="text-xl font-semibold mb-6">Frequently Asked Questions</h3>
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
              <div className="p-4 text-gray-700">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
