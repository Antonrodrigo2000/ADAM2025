"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Shield, Truck, Clock, Users, ArrowRight, Zap, Target, Sparkles, Award } from "lucide-react"
import Image from "next/image"
import ProductFooter from "./product-footer"
import PricingToggle from "./pricing-toggle"
import FloatingCTA from "./floating-cta"

export default function CombinationSprayProductPage() {
  const [isSubscription, setIsSubscription] = useState(true)

  const pricing = {
    oneTime: { price: 49.99, originalPrice: 69.99 },
    subscription: { price: 39.99, originalPrice: 49.99, savings: 20 },
  }

  const benefits = [
    { icon: Target, title: "Dual-Action Formula", description: "Minoxidil + Finasteride for maximum results" },
    { icon: Zap, title: "Faster Results", description: "See improvements in just 6-8 weeks" },
    { icon: Sparkles, title: "Premium Blend", description: "Enhanced with natural growth factors" },
    { icon: Award, title: "Clinically Superior", description: "Outperforms single-ingredient solutions" },
  ]

  const ingredients = [
    { name: "Minoxidil 5%", benefit: "Stimulates hair follicles" },
    { name: "Finasteride 0.1%", benefit: "Blocks DHT production" },
    { name: "Adenosine", benefit: "Extends growth phase" },
    { name: "Copper Peptides", benefit: "Strengthens hair structure" },
  ]

  const features = [
    "Dual-action hair regrowth formula",
    "Convenient spray application",
    "Alcohol-free, gentle formula",
    "Suitable for all hair types",
    "Clinically tested combination",
    "180-day money-back guarantee",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="container mx-auto px-3 py-4 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Product Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-200 rounded-2xl p-6 lg:p-12 shadow-xl">
              <div className="relative aspect-square max-w-sm mx-auto">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Adam Combination Spray - Minoxidil + Finasteride"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
                <Badge className="absolute -top-2 -right-2 bg-emerald-600 text-white px-2 py-1 text-xs">
                  Best Seller
                </Badge>
              </div>
            </div>

            {/* Floating Benefits */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg border hidden lg:block">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">75K+ Success Stories</span>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg border hidden lg:block">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm font-medium ml-1">4.9</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <Badge variant="outline" className="mb-2 text-xs border-emerald-200 text-emerald-700">
                Advanced Formula
              </Badge>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Adam Combination Spray</h1>
              <p className="text-base lg:text-lg text-gray-600 mb-4">
                Powerful dual-action formula combining Minoxidil + Finasteride for superior hair regrowth
              </p>
            </div>

            {/* Pricing Toggle */}
            <PricingToggle
              isSubscription={isSubscription}
              setIsSubscription={setIsSubscription}
              pricing={pricing}
              accentColor="emerald"
            />

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button - Desktop */}
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hidden lg:flex items-center justify-center gap-2"
            >
              Start Advanced Treatment
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Shield className="w-3 h-3" />
                <span>180-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Truck className="w-3 h-3" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>Results in 6-8 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-8 lg:py-16">
        <div className="container mx-auto px-3">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">Why Choose Our Combination Formula?</h2>
            <p className="text-sm lg:text-lg text-gray-600 max-w-2xl mx-auto">
              The most advanced hair regrowth solution combining two clinically proven ingredients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{benefit.title}</h3>
                  <p className="text-xs lg:text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 py-8 lg:py-16">
        <div className="container mx-auto px-3">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">Powerful Active Ingredients</h2>
            <p className="text-sm lg:text-lg text-gray-600">
              Each ingredient is carefully selected for maximum efficacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {ingredients.map((ingredient, index) => (
              <Card key={index} className="border-0 shadow-md bg-white">
                <CardContent className="p-4 lg:p-6">
                  <h3 className="font-bold text-emerald-600 mb-2 text-sm lg:text-base">{ingredient.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-600">{ingredient.benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-white py-8 lg:py-16">
        <div className="container mx-auto px-3">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">Why Combination Therapy Works Better</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <Card className="border-2 border-gray-200">
                <CardContent className="p-4 lg:p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Minoxidil Only</h3>
                  <div className="space-y-2 text-xs lg:text-sm text-gray-600">
                    <p>✓ Stimulates growth</p>
                    <p>✗ Doesn't stop hair loss</p>
                    <p>✗ Limited effectiveness</p>
                  </div>
                  <div className="mt-4 text-lg lg:text-xl font-bold text-gray-600">60% Success Rate</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-500 relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-xs">
                  Recommended
                </Badge>
                <CardContent className="p-4 lg:p-6 text-center">
                  <h3 className="font-semibold text-emerald-600 mb-3 text-sm lg:text-base">Combination Formula</h3>
                  <div className="space-y-2 text-xs lg:text-sm text-gray-600">
                    <p>✓ Stimulates growth</p>
                    <p>✓ Stops hair loss</p>
                    <p>✓ Maximum effectiveness</p>
                  </div>
                  <div className="mt-4 text-lg lg:text-xl font-bold text-emerald-600">85% Success Rate</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200">
                <CardContent className="p-4 lg:p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">Finasteride Only</h3>
                  <div className="space-y-2 text-xs lg:text-sm text-gray-600">
                    <p>✓ Stops hair loss</p>
                    <p>✗ Limited regrowth</p>
                    <p>✗ Oral side effects</p>
                  </div>
                  <div className="mt-4 text-lg lg:text-xl font-bold text-gray-600">70% Success Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 py-8 lg:py-16">
        <div className="container mx-auto px-3">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">Real Results from Real Customers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              {
                name: "Alex M.",
                rating: 5,
                text: "Incredible results! My hairline is completely restored after 4 months.",
              },
              {
                name: "Ryan T.",
                rating: 5,
                text: "The combination formula worked where others failed. Highly recommend!",
              },
              { name: "Chris P.", rating: 5, text: "Best decision I made. Thicker, fuller hair and no side effects." },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md bg-white">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600 mb-3">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900 text-xs lg:text-sm">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8 lg:py-16">
        <div className="container mx-auto px-3 text-center">
          <h2 className="text-xl lg:text-3xl font-bold text-white mb-3">Experience the Power of Combination Therapy</h2>
          <p className="text-sm lg:text-lg text-emerald-100 mb-6 max-w-2xl mx-auto">
            Join thousands who have achieved superior results with our advanced dual-action formula
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-gray-100 py-3 px-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hidden lg:inline-flex items-center gap-2"
          >
            Start Advanced Treatment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ProductFooter />
      <FloatingCTA productName="Combination Spray" />
    </div>
  )
}
