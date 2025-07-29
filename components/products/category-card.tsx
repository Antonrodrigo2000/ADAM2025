"use client"

import Link from "next/link"
import { useState } from "react"
import type { HealthVertical } from "@/types/products"

interface CategoryCardProps {
  vertical: HealthVertical
}

export function CategoryCard({ vertical }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "hair":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
      case "sexual-health":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )
      case "skincare":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`group relative bg-gradient-to-br ${vertical.gradient_from} ${vertical.gradient_to} rounded-2xl p-8 shadow-sm border border-white/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-700 mb-6 shadow-sm group-hover:shadow-md transition-shadow duration-300">
          {getIcon(vertical.icon)}
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{vertical.name}</h3>

        <p className="text-gray-700 mb-6 leading-relaxed">{vertical.description}</p>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-sm text-gray-600">From</span>
            <div className="text-2xl font-bold text-gray-900">LKR {vertical.pricing_from.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{vertical.product_count} treatments</div>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/products/${vertical.slug}`}>
          <button className="w-full bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:bg-gray-50 border border-gray-200">
            View Treatments
            <svg
              className={`inline-block ml-2 w-4 h-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  )
}
