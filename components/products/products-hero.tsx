"use client"

import { useState } from "react"

export function ProductsHero() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Treatments designed for <span className="text-blue-600">modern men</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Discreet, effective healthcare solutions delivered to your door. Consult with licensed physicians from the
        comfort of your home.
      </p>

      <div className="max-w-md mx-auto relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
