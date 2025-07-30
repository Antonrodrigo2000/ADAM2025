"use client"

import { useState } from "react"
import type { Product } from "@/types/product"

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ingredients", label: "Ingredients" },
    { id: "safety", label: "Safety" },
  ]

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 shadow-[inset_0_2px_4px_rgba(59,130,246,0.1)]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)]"
              } rounded-t-lg`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Benefits */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h3>
              <ul className="space-y-3">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-5 h-5 text-green-600"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How It Works */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Active Ingredients</h3>
              <div className="grid gap-6">
                {product.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{ingredient.name}</h4>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {ingredient.dosage}
                      </span>
                    </div>
                    <p className="text-gray-600">{ingredient.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Studies */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Clinical Studies</h3>
              <div className="grid gap-4">
                {product.clinical_studies.map((study, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{study.title}</h4>
                      <span className="text-sm font-bold text-green-600">{study.efficacy_rate}% effective</span>
                    </div>
                    <p className="text-gray-600">{study.description}</p>
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
                    <div className="flex-shrink-0 w-4 h-4 mt-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-orange-500"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
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
                    <div className="flex-shrink-0 w-4 h-4 mt-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-red-500"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
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
                    <div className="flex-shrink-0 w-4 h-4 mt-1">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-yellow-500"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 pt-16 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {product.faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <div className="flex-shrink-0 w-5 h-5 ml-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </summary>
              <div className="px-4 pb-4 text-gray-700 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
