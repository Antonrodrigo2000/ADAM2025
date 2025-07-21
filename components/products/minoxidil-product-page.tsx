"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Shield, Truck, Clock, Users, ArrowRight, Heart, Zap, Award } from "lucide-react"
import Image from "next/image"
import ProductFooter from "./product-footer"
import PricingToggle from "./pricing-toggle"
import FloatingCTA from "./floating-cta"

export default function MinoxidilProductPage() {
  const [isSubscription, setIsSubscription] = useState(true)

  const pricing = {
    oneTime: { price: 29.99, originalPrice: 39.99 },
    subscription: { price: 24.99, originalPrice: 29.99, savings: 17 },
  }

  const benefits = [
    { icon: Zap, title: "Fast-Acting Formula", description: "See results in as little as 8-12 weeks" },
    { icon: Shield, title: "Clinically Proven", description: "FDA-approved minoxidil 5% solution" },
    { icon: Heart, title: "Gentle on Scalp", description: "Alcohol-free formula reduces irritation" },
    { icon: Award, title: "Premium Quality", description: "Pharmaceutical-grade ingredients" },
  ]

  const features = [
    "5% Minoxidil concentration",
    "Alcohol-free formula",
    "Easy-to-use dropper bottle",
    "Suitable for all hair types",
    "Dermatologist recommended",
    "90-day money-back guarantee",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-3 py-4 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Product Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-6 lg:p-12 shadow-xl">
              <div className="relative aspect-square max-w-sm mx-auto">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Adam Minoxidil 5% Solution"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white px-2 py-1 text-xs">
                  FDA Approved
                </Badge>
              </div>
            </div>

            {/* Floating Benefits */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg border hidden lg:block">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium">50K+ Happy Customers</span>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg border hidden lg:block">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm font-medium ml-1">4.8</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <Badge variant="outline" className="mb-2 text-xs">
                Hair Loss Treatment
              </Badge>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Adam Minoxidil 5%</h1>
              <p className="text-base lg:text-lg text-gray-600 mb-4">
                Professional-strength hair regrowth solution with clinically proven results
              </p>
            </div>

            {/* Pricing Toggle */}
            <PricingToggle isSubscription={isSubscription} setIsSubscription={setIsSubscription} pricing={pricing} />

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button - Desktop */}
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hidden lg:flex items-center justify-center gap-2"
            >
              Start Treatment Now
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Shield className="w-3 h-3" />
                <span>90-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Truck className="w-3 h-3" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>Results in 8-12 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-8 lg:py-16">
        <div className="container mx-auto px-3">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">Why Choose Adam Minoxidil?</h2>
            <p className="text-sm lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Our premium formulation delivers proven results with minimal side effects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4 lg:p-6 text-center">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">{benefit.title}</h3>
                  <p className="text-xs lg:text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8 lg:py-16">
        <div className="container mx-auto px-3">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-sm lg:text-lg text-gray-600">Simple 3-step process for hair regrowth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { step: "01", title: "Apply Daily", description: "Use 1ml twice daily on affected areas" },
              { step: "02", title: "Massage Gently", description: "Massage into scalp for better absorption" },
              { step: "03", title: "See Results", description: "Notice new growth in 8-12 weeks" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg lg:text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-lg">{item.title}</h3>
                <p className="text-xs lg:text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-8 lg:py-16">
        <div className="container mx-auto px-3">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { name: "Michael R.", rating: 5, text: "Noticed new hair growth after just 10 weeks. Amazing results!" },
              { name: "David L.", rating: 5, text: "No irritation like other brands. Gentle yet effective formula." },
              { name: "James K.", rating: 5, text: "Best investment I've made. My confidence is back!" },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md">
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8 lg:py-16">
        <div className="container mx-auto px-3 text-center">
          <h2 className="text-xl lg:text-3xl font-bold text-white mb-3">Ready to Start Your Hair Regrowth Journey?</h2>
          <p className="text-sm lg:text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have regained their confidence with Adam Minoxidil
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 py-3 px-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hidden lg:inline-flex items-center gap-2"
          >
            Start Treatment Today
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ProductFooter />
      <FloatingCTA productName="Adam Minoxidil 5%" />
    </div>
  )
}
