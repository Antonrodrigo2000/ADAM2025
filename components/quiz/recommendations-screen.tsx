"use client"

import { ArrowRight } from "lucide-react"
import type { BaseRecommendationResult } from "@/lib/algorithm/types"

interface RecommendationsScreenProps {
  recommendations: BaseRecommendationResult
  onBack: () => void
}

export function RecommendationsScreen({ recommendations, onBack }: RecommendationsScreenProps) {
  // This component should rarely be shown now since we do direct redirects
  // It's only used for consultation/referral cases



  const getReferralContent = () => {
    return {
      title: "Consultation Required",
      subtitle: "Let's discuss your options",
      description: recommendations.message || "Based on your responses, we recommend a consultation to determine the best treatment approach.",
      cta: "Book Consultation",
    }
  }

  const referralContent = getReferralContent()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full">
        <ReferralSection referralContent={referralContent} />
        <BackButton onBack={onBack} />
      </div>
    </div>
  )
}

interface ReferralSectionProps {
  referralContent: {
    title: string
    subtitle: string
    description: string
    cta: string
  }
}

function ReferralSection({ referralContent }: ReferralSectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Referral Content */}
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-neutral-300/20 via-neutral-100/30 to-neutral-300/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg">
            <span className="text-sm font-medium text-white drop-shadow-sm">Next Steps</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tighter">
              {referralContent.title}
            </h1>
            <p className="text-xl text-neutral-400">{referralContent.subtitle}</p>
            <p className="text-neutral-500 leading-relaxed max-w-lg mx-auto">{referralContent.description}</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <button className="group relative w-full max-w-md mx-auto p-px overflow-hidden rounded-full">
            <div
              className="pointer-events-none absolute -inset-px rounded-full opacity-100 transition-opacity duration-500 group-hover:opacity-100 animate-spin-slow"
              style={{
                background: `conic-gradient(from 0deg, #000000, #404040, #ffffff, #808080, #000000)`,
                animationDuration: "3s",
              }}
            />
            <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 hover:from-neutral-800 hover:via-neutral-600 hover:to-neutral-800 text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center border border-neutral-600">
              {referralContent.cta}
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

interface BackButtonProps {
  onBack: () => void
}

function BackButton({ onBack }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className="fixed top-8 left-8 z-50 text-neutral-500 hover:text-neutral-300 transition-colors duration-200 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
    >
      ← Back to review
    </button>
  )
}
