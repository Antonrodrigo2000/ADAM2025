"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface Product {
  id: number
  slug: string
  name: string
  shortName: string
  oneTimePrice: number
  subscriptionPrice: number
  originalPrice: number
  image: string
  category: string
  description: string
  longDescription: string
  benefits: string[]
  ingredients: string[]
  usage: string
  warnings: string[]
  inStock: boolean
}

interface ProductPageProps {
  product: Product
}

export function ProductPage({ product }: ProductPageProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSubscription, setIsSubscription] = useState(false)

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ingredients", label: "Formula" },
    { id: "usage", label: "Application" },
    { id: "safety", label: "Safety" },
  ]

  const currentPrice = isSubscription ? product.subscriptionPrice : product.oneTimePrice

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-black to-neutral-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,165,0,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,140,0,0.02),transparent_50%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-3 py-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-3 py-4 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-120px)]">
          {/* Product Image - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="neomorphic-container h-full flex flex-col">
              <div className="flex-1 relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800/50 to-neutral-900/50">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>

          {/* Product Info - 3 columns */}
          <div className="lg:col-span-3 space-y-4 overflow-y-auto">
            {/* Header */}
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="bg-orange-500/10 text-orange-300 border-orange-500/20 text-xs px-2 py-1"
              >
                {product.category}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-white/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Payment Toggle */}
            <div className="neomorphic-container p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Option</span>
                  <div className="text-xs text-orange-300">{isSubscription ? "Save 17%" : "One-time"}</div>
                </div>

                <div className="neomorphic-slider-container">
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="1"
                      value={isSubscription ? 1 : 0}
                      onChange={(e) => setIsSubscription(e.target.value === "1")}
                      className="neomorphic-slider"
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                      <span className={`text-xs transition-colors ${!isSubscription ? "text-white" : "text-white/40"}`}>
                        One-time
                      </span>
                      <span
                        className={`text-xs transition-colors ${isSubscription ? "text-orange-300" : "text-white/40"}`}
                      >
                        Subscription
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-bold text-white">${currentPrice}</span>
                    {isSubscription && (
                      <span className="text-xs text-white/50 line-through">${product.oneTimePrice}</span>
                    )}
                  </div>
                  <span className="text-xs text-white/60">{isSubscription ? "/month" : "one-time"}</span>
                </div>
              </div>
            </div>

            {/* Neomorphic Tabs */}
            <div className="space-y-4">
              <div className="neomorphic-tabs-container">
                <div className="flex space-x-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                        activeTab === tab.id ? "text-white neomorphic-tab-active" : "text-white/50 hover:text-white/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="neomorphic-container p-4 min-h-[200px]">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Treatment Details</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{product.longDescription}</p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-orange-300">Key Benefits</h4>
                      <div className="grid gap-2">
                        {product.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-1 h-1 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                            <span className="text-xs text-white/70">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ingredients" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Active Formula</h3>
                    <div className="grid gap-2">
                      {product.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-neutral-800/30">
                          <div className="w-1 h-1 rounded-full bg-orange-400"></div>
                          <span className="text-xs text-white/70">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Application Method</h3>
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <p className="text-xs text-white/70 leading-relaxed">{product.usage}</p>
                    </div>
                  </div>
                )}

                {activeTab === "safety" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Safety Information</h3>
                    <div className="space-y-2">
                      {product.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
                        >
                          <div className="w-1 h-1 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                          <span className="text-xs text-white/70">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Link href="/quiz">
          <Button className="neomorphic-cta-button px-6 py-3 text-sm font-semibold">
            Start Assessment
            <div className="ml-2 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></div>
          </Button>
        </Link>
      </div>

      <style jsx>{`
        .neomorphic-container {
          background: rgba(15, 15, 15, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.6),
            -12px -12px 24px rgba(255, 255, 255, 0.01),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          backdrop-filter: blur(20px);
        }

        .neomorphic-tabs-container {
          background: rgba(10, 10, 10, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 
            inset 6px 6px 12px rgba(0, 0, 0, 0.4),
            inset -6px -6px 12px rgba(255, 255, 255, 0.01);
          border-radius: 12px;
          padding: 4px;
        }

        .neomorphic-tab-active {
          background: linear-gradient(145deg, rgba(255, 165, 0, 0.15), rgba(255, 140, 0, 0.08));
          box-shadow: 
            6px 6px 12px rgba(0, 0, 0, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.01),
            inset 0 0 0 1px rgba(255, 165, 0, 0.2);
          border: 1px solid rgba(255, 165, 0, 0.15);
        }

        .neomorphic-slider-container {
          position: relative;
          height: 40px;
          background: rgba(5, 5, 5, 0.8);
          border-radius: 20px;
          box-shadow: 
            inset 8px 8px 16px rgba(0, 0, 0, 0.5),
            inset -8px -8px 16px rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .neomorphic-slider {
          width: 100%;
          height: 100%;
          background: transparent;
          outline: none;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
        }

        .neomorphic-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.7));
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.4),
            -4px -4px 8px rgba(255, 255, 255, 0.02),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          cursor: pointer;
          border: 1px solid rgba(255, 165, 0, 0.3);
        }

        .neomorphic-slider::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.7));
          box-shadow: 
            4px 4px 8px rgba(0, 0, 0, 0.4),
            -4px -4px 8px rgba(255, 255, 255, 0.02);
          cursor: pointer;
          border: 1px solid rgba(255, 165, 0, 0.3);
        }

        .neomorphic-cta-button {
          background: linear-gradient(145deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.8));
          border: 1px solid rgba(255, 165, 0, 0.3);
          border-radius: 25px;
          color: white;
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.4),
            -8px -8px 16px rgba(255, 255, 255, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .neomorphic-cta-button:hover {
          background: linear-gradient(145deg, rgba(255, 165, 0, 1), rgba(255, 140, 0, 0.9));
          box-shadow: 
            12px 12px 24px rgba(0, 0, 0, 0.5),
            -12px -12px 24px rgba(255, 255, 255, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .neomorphic-cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
