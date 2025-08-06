"use client"

import { CheckCircle, Sparkles } from "lucide-react"

interface RecommendationBannerProps {
  productName: string
}

export function RecommendationBanner({ productName }: RecommendationBannerProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <Sparkles className="h-3 w-3 text-green-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Personalized Recommendation
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">
              <span className="font-medium">Perfect match found!</span> Based on your hair loss assessment, 
              <span className="font-semibold text-green-700"> {productName}</span> is specifically recommended for your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}