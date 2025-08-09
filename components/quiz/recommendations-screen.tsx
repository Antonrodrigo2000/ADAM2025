"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { RecommendationResult } from "@/lib/algorithm/hairloss-recommendations"

interface RecommendationsScreenProps {
  recommendations: RecommendationResult
  patientData: Record<string, any>
  onBack: () => void
}

export function RecommendationsScreen({ recommendations, patientData: _patientData, onBack }: RecommendationsScreenProps) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const canPurchase =
    recommendations.recommendation === "Minoxidil 5% Standalone" ||
    recommendations.recommendation === "Minoxidil + Finasteride Spray"

  const getProductSlug = () => {
    if (recommendations.recommendation === "Minoxidil 5% Standalone") {
      return "minoxidil-topical-usp-5"
    } else if (recommendations.recommendation === "Minoxidil + Finasteride Spray") {
      return "6888fa5ae4b41311603613c9"
    }
    return null
  }

  // Auto-redirect if recommendation is successful (purchasable)
  useEffect(() => {
    if (canPurchase) {
      const slug = getProductSlug()
      if (slug) {
        // Add recommendation parameter to indicate this is from quiz recommendation
        const productUrl = `/products/${slug}?recommended=true&from=quiz`
        
        // Set loading state immediately
        setIsRedirecting(true)
        
        // Prefetch the route to start loading data in the background
        router.prefetch(`/products/${slug}`)
        
        // Start navigation after a brief moment to ensure loading state is visible
        // The loading state will persist until the new page is fully loaded
        setTimeout(() => {
          router.push(productUrl)
        }, 300) // Small delay to ensure spinner is visible
      }
    }
  }, [canPurchase, router])

  const getReferralContent = () => {
    if (recommendations.recommendation === "Refer to dermatologist") {
      return {
        title: "Specialist Consultation Required",
        subtitle: "Your case requires specialized attention",
        description:
          "Based on your assessment, we recommend consulting with a dermatologist for the most appropriate treatment approach.",
        cta: "Find a Dermatologist",
      }
    } else if (recommendations.recommendation === "Deny treatment") {
      return {
        title: "Alternative Options Available",
        subtitle: "Let's explore other solutions",
        description:
          "Our standard treatments aren't suitable for your specific case, but there are other effective options we can discuss.",
        cta: "Explore Alternatives",
      }
    }
    return null
  }

  const referralContent = getReferralContent()

  // If it's a purchasable recommendation, show loading state
  if (canPurchase && isRedirecting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <Loader2 className="w-16 h-16 animate-spin text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display">Preparing Your Treatment</h2>
            <p className="text-neutral-400">Getting your personalized product details ready...</p>
          </div>
        </div>
      </div>
    )
  }

  // If it's a purchasable recommendation but not redirecting yet, return null
  // Only render referral content for non-purchasable cases
  if (canPurchase) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full">
        {referralContent && <ReferralSection referralContent={referralContent} />}
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
