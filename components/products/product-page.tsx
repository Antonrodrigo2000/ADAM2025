"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Truck, Clock, CheckCircle, AlertTriangle, ArrowLeft, Heart, Share2 } from "lucide-react"

interface Product {
  id: number
  slug: string
  name: string
  shortName: string
  price: number
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
  rating: number
  reviewCount: number
}

interface ProductPageProps {
  product: Product
}

export function ProductPage({ product }: ProductPageProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isWishlisted, setIsWishlisted] = useState(false)

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ingredients", label: "Ingredients" },
    { id: "usage", label: "How to Use" },
    { id: "safety", label: "Safety Info" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0 techno-grid opacity-30"
          style={
            {
              "--grid-color": "rgba(255, 165, 0, 0.05)",
              "--grid-size": "80px",
            } as React.CSSProperties
          }
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/10" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2 rounded-full transition-colors ${
                  isWishlisted ? "text-red-500" : "text-white/60 hover:text-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
              <button className="p-2 rounded-full text-white/60 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="neomorphic-card p-8 bg-neutral-900/50 backdrop-blur-md">
              <div className="aspect-square relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="neomorphic-card-small p-4 text-center bg-neutral-900/30 backdrop-blur-sm">
                <Shield className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <p className="text-xs text-white/80">FDA Approved</p>
              </div>
              <div className="neomorphic-card-small p-4 text-center bg-neutral-900/30 backdrop-blur-sm">
                <Truck className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <p className="text-xs text-white/80">Free Shipping</p>
              </div>
              <div className="neomorphic-card-small p-4 text-center bg-neutral-900/30 backdrop-blur-sm">
                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                <p className="text-xs text-white/80">Fast Results</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                {product.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-neutral-600"
                      }`}
                    />
                  ))}
                  <span className="text-white/80 ml-2">{product.rating}</span>
                </div>
                <span className="text-white/60">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-white">${product.price}</span>
              <span className="text-xl text-white/50 line-through">${product.originalPrice}</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-lg text-white/80 leading-relaxed">{product.description}</p>

            {/* Neomorphic Tabs */}
            <div className="space-y-6">
              <div className="neomorphic-tabs-container p-2 bg-neutral-900/50 backdrop-blur-md rounded-2xl">
                <div className="flex space-x-1 relative">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === tab.id ? "text-white neomorphic-tab-active" : "text-white/60 hover:text-white/80"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="neomorphic-card p-6 bg-neutral-900/30 backdrop-blur-md min-h-[200px]">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">About This Treatment</h3>
                    <p className="text-white/80 leading-relaxed">{product.longDescription}</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-300">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {product.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-white/80">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "ingredients" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Active Ingredients</h3>
                    <div className="grid gap-3">
                      {product.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-800/50">
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          <span className="text-white/80">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "usage" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">How to Use</h3>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-white/80 leading-relaxed">{product.usage}</p>
                    </div>
                    <div className="text-sm text-white/60">
                      <p>
                        💡 <strong>Pro Tip:</strong> For best results, use consistently at the same times each day.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "safety" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Safety Information</h3>
                    <div className="space-y-3">
                      {product.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                        >
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80">{warning}</span>
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
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="floating-cta-container">
          <Link href="/quiz">
            <Button
              size="lg"
              className="floating-cta-button px-8 py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-2xl"
            >
              Start Questionnaire
              <div className="ml-2 w-2 h-2 rounded-full bg-white animate-pulse"></div>
            </Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .techno-grid {
          background-image: 
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
          background-size: var(--grid-size) var(--grid-size);
        }

        .neomorphic-card {
          background: rgba(23, 23, 23, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            20px 20px 40px rgba(0, 0, 0, 0.4),
            -20px -20px 40px rgba(255, 255, 255, 0.02),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          backdrop-filter: blur(20px);
        }

        .neomorphic-card-small {
          background: rgba(23, 23, 23, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            10px 10px 20px rgba(0, 0, 0, 0.3),
            -10px -10px 20px rgba(255, 255, 255, 0.01);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .neomorphic-tabs-container {
          background: rgba(23, 23, 23, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            inset 8px 8px 16px rgba(0, 0, 0, 0.3),
            inset -8px -8px 16px rgba(255, 255, 255, 0.02);
        }

        .neomorphic-tab-active {
          background: linear-gradient(145deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.1));
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.2),
            -8px -8px 16px rgba(255, 255, 255, 0.02),
            inset 0 0 0 1px rgba(255, 165, 0, 0.3);
          border: 1px solid rgba(255, 165, 0, 0.2);
        }

        .floating-cta-container {
          animation: float 3s ease-in-out infinite;
        }

        .floating-cta-button {
          border-radius: 50px;
          box-shadow: 
            0 20px 40px rgba(255, 165, 0, 0.3),
            0 10px 20px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .floating-cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shine 2s infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
