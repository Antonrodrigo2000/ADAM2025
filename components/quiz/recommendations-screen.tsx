"use client"

import { ArrowRight, Check } from "lucide-react"
import type { RecommendationResult } from "@/lib/hairloss-recommendations"

interface RecommendationsScreenProps {
  recommendations: RecommendationResult
  patientData: Record<string, any>
  onBack: () => void
}

export function RecommendationsScreen({ recommendations, patientData, onBack }: RecommendationsScreenProps) {
  const canPurchase =
    recommendations.recommendation === "Minoxidil 5% Standalone" ||
    recommendations.recommendation === "Minoxidil + Finasteride Spray"

  const getProductDetails = () => {
    if (recommendations.recommendation === "Minoxidil 5% Standalone") {
      return {
        name: "ADAM Minoxidil 5%",
        subtitle: "Clinical-Grade Formula",
        price: "$29",
        period: "/month",
        originalPrice: "$39",
        tagline: "Clinically proven. FDA approved.",
        description:
          "Stop hair loss in its tracks with our precision-formulated 5% Minoxidil solution. Designed for men who demand results.",
        features: [
          "5% Minoxidil - Maximum strength",
          "Precision applicator included",
          "Visible results in 3-4 months",
          "Free shipping & physician monitoring",
        ],
        imageQuery: "minoxidil hair loss treatment bottle product shot",
      }
    } else if (recommendations.recommendation === "Minoxidil + Finasteride Spray") {
      return {
        name: "ADAM Personalized Spray",
        subtitle: "Dual-Action Formula",
        price: "$49",
        period: "/month",
        originalPrice: "$69",
        tagline: "Maximum strength. Maximum results.",
        description:
          "The gold standard in hair loss treatment. Our physician-formulated combination targets hair loss from multiple angles.",
        features: [
          "Minoxidil 5% + Finasteride 0.1%",
          "Dual-action hair regrowth",
          "Physician monitored treatment",
          "Free shipping & ongoing support",
        ],
        imageQuery: "hair loss treatment spray bottle professional medical",
      }
    }
    return null
  }

  const productDetails = getProductDetails()

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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Full-width container without padding constraints */}
      <div className="w-full">
        {canPurchase && productDetails ? (
          <div className="grid lg:grid-cols-2 min-h-screen">
            {/* Left side - Product Image */}
            <div className="relative bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center overflow-hidden">
              {/* Subtle orange glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-400/10" />

              {/* Product image placeholder - full container */}
              <div className="relative z-10 w-full h-full">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Combination_Spray_in_use_1000x1000_63741849-eb84-4928-b914-51720ee80075_1440x-kcLimtiGQGDu8hzt8E0wjfqni8S9cO.webp"
                  alt={productDetails.name}
                  className="w-full h-full object-cover filter brightness-110"
                />
              </div>
            </div>

            {/* Right side - Product Details & CTA */}
            <div className="flex items-center justify-center p-8 lg:p-16">
              <div className="max-w-lg w-full space-y-8">
                {/* Header */}
                <div className="space-y-4">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-neutral-300/20 via-neutral-100/30 to-neutral-300/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg">
                    <span className="text-sm font-medium text-white drop-shadow-sm">Recommended for You</span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tighter">
                      {productDetails.name}
                    </h1>
                    <p className="text-lg text-orange-400 font-medium">{productDetails.subtitle}</p>
                    <p className="text-neutral-400 leading-relaxed">{productDetails.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {productDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-5xl font-bold text-white">{productDetails.price}</span>
                    <span className="text-xl text-neutral-400">{productDetails.period}</span>
                    {productDetails.originalPrice && (
                      <span className="text-lg text-neutral-500 line-through">{productDetails.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">Cancel anytime • Free shipping • Physician monitored</p>
                </div>

                {/* CTA Button */}
                <div className="space-y-4">
                  <button className="group relative w-full p-px overflow-hidden rounded-full">
                    <div
                      className="pointer-events-none absolute -inset-px rounded-full opacity-100 transition-opacity duration-500 group-hover:opacity-100 animate-spin-slow"
                      style={{
                        background: `conic-gradient(from 0deg, #000000, #404040, #ffffff, #808080, #000000)`,
                        animationDuration: "3s",
                      }}
                    />
                    <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 hover:from-neutral-800 hover:via-neutral-600 hover:to-neutral-800 text-white font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 flex items-center justify-center group-hover:scale-[1.02] border border-neutral-600">
                      Start Your Treatment
                      <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <p className="text-xs text-center text-neutral-500">
                    Join thousands of men who've reclaimed their confidence
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : referralContent ? (
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
        ) : null}

        {/* Back button - positioned absolutely */}
        <button
          onClick={onBack}
          className="fixed top-8 left-8 z-50 text-neutral-500 hover:text-neutral-300 transition-colors duration-200 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
        >
          ← Back to review
        </button>
      </div>
    </div>
  )
}
