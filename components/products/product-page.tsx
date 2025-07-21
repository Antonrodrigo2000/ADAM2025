"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface ProductSection {
  id: string
  title: string
  content: string
  expanded?: boolean
}

interface Product {
  id: number
  slug: string
  name: string
  badge: string
  description: string
  mainImage: string
  thumbnails: string[]
  sections: ProductSection[]
  disclaimer?: string
  footnote?: string
}

interface ProductPageProps {
  product: Product
}

export function ProductPage({ product }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(product.mainImage)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(product.sections.filter((s) => s.expanded).map((s) => s.id)),
  )

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <Link href="/" className="text-2xl font-light text-black">
          hims
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/auth" className="text-sm text-black hover:text-gray-600">
            Log in
          </Link>
          <button className="flex flex-col gap-1">
            <div className="w-5 h-0.5 bg-black"></div>
            <div className="w-5 h-0.5 bg-black"></div>
            <div className="w-5 h-0.5 bg-black"></div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Left Side - Product Image */}
        <div className="flex-1 bg-gray-100 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-lg w-full">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex justify-center gap-3 p-6">
            {product.thumbnails.map((thumb, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(thumb)}
                className={`w-12 h-12 rounded-full border-2 overflow-hidden ${
                  selectedImage === thumb ? "border-black" : "border-gray-300"
                }`}
              >
                <Image
                  src={thumb || "/placeholder.svg"}
                  alt={`Product view ${index + 1}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="w-96 bg-white p-8 flex flex-col">
          {/* Badge */}
          <div className="text-xs text-gray-600 mb-4 flex items-center gap-1">
            <span className="text-orange-500">★</span>
            {product.badge}
          </div>

          {/* Product Title */}
          <h1 className="text-2xl font-normal text-black mb-6 leading-tight">{product.name}</h1>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-8 leading-relaxed">{product.description}</p>

          {/* CTA Button */}
          <button className="w-full bg-black text-white py-4 rounded-full text-sm font-medium mb-6 hover:bg-gray-900 transition-colors">
            Get started
          </button>

          {/* Secondary Link */}
          <Link href="/quiz" className="text-sm text-black underline mb-8 hover:text-gray-600">
            See if treatment is right for me
          </Link>

          {/* Safety Info Link */}
          <Link href="#" className="text-sm text-gray-600 mb-8 flex items-center gap-2 hover:text-black">
            <span className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center text-xs">
              i
            </span>
            Important safety information
            <span className="ml-auto">→</span>
          </Link>

          {/* Expandable Sections */}
          <div className="space-y-4 flex-1">
            {product.sections.map((section) => (
              <div key={section.id} className="border-b border-gray-100 pb-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between text-left py-2"
                >
                  <span className="text-sm font-medium text-black">{section.title}</span>
                  <span className="text-gray-400 text-lg">{expandedSections.has(section.id) ? "−" : "+"}</span>
                </button>
                {expandedSections.has(section.id) && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-600 leading-relaxed">{section.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Text */}
          <div className="mt-8 space-y-3">
            {product.disclaimer && <p className="text-xs text-gray-500 leading-relaxed">{product.disclaimer}</p>}
            {product.footnote && <p className="text-xs text-gray-500">{product.footnote}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
