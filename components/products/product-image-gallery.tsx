"use client"

import { useState } from "react"
import Image from "next/image"
import type { ProductImage } from "@/types/product"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductImageGalleryProps {
  images: ProductImage[]
  selectedIndex: number
  onImageSelect: (index: number) => void
}

export function ProductImageGallery({ images, selectedIndex, onImageSelect }: ProductImageGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)

  const nextImage = () => {
    onImageSelect((selectedIndex + 1) % images.length)
  }

  const prevImage = () => {
    onImageSelect(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
  }

  return (
    <div className="space-y-6">
      {/* Main Image - Neumorphic Container */}
      <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden group shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)] border border-gray-200/30">
        <div className="absolute inset-2 bg-white rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] overflow-hidden">
          <Image
            src={images[selectedIndex]?.url || "/placeholder.svg"}
            alt={images[selectedIndex]?.alt_text || "Product image"}
            fill
            className={`object-cover transition-transform duration-300 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        </div>

        {/* Navigation Arrows - Neumorphic Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.95)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.95)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </>
        )}

        {/* Image Counter - Neumorphic Badge */}
        <div className="absolute bottom-4 right-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Gallery - Neumorphic Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => onImageSelect(index)}
              className={`relative aspect-square bg-gray-100 rounded-2xl overflow-hidden transition-all duration-300 ${
                index === selectedIndex
                  ? "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border-2 border-blue-300/50"
                  : "shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9)]"
              }`}
            >
              <div className="absolute inset-1 bg-white rounded-xl overflow-hidden shadow-[2px_2px_4px_rgba(0,0,0,0.05)]">
                <Image src={image.url || "/placeholder.svg"} alt={image.alt_text} fill className="object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
