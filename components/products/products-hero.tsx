"use client"

import { useState } from "react"
import { Search, Shield, Truck, Clock, Award } from "lucide-react"

export function ProductsHero() {
  const [searchQuery, setSearchQuery] = useState("")

  const trustBadges = [
    {
      icon: Shield,
      title: "Licensed Physicians",
      description: "All treatments prescribed by qualified doctors",
    },
    {
      icon: Truck,
      title: "Discreet Packaging",
      description: "Private and secure delivery to your door",
    },
    {
      icon: Clock,
      title: "2-Day Consultation",
      description: "Quick response guarantee from our medical team",
    },
    {
      icon: Award,
      title: "90-Day Guarantee",
      description: "Money back if you're not satisfied with results",
    },
  ]

  return (
    <div className="text-center mb-16">
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Treatments designed for modern men</h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Get expert medical care from the comfort of your home. Our licensed physicians provide personalized treatment
          plans for hair loss, sexual health, and skincare.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search treatments, conditions, or medications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <span className="text-sm text-gray-500">Popular searches:</span>
            {["Hair Loss", "ED Treatment", "Acne", "Anti-aging"].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {trustBadges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <badge.icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{badge.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{badge.description}</p>
          </div>
        ))}
      </div>

      {/* Section Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose your health focus</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the area you'd like to focus on. Our medical team will provide personalized treatment recommendations
          based on your needs.
        </p>
      </div>
    </div>
  )
}
