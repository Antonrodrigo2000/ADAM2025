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
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={images[selectedIndex]?.url || "/placeholder.svg"}
          alt={images[selectedIndex]?.alt_text || "Product image"}
          fill
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => onImageSelect(index)}
              className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selectedIndex ? "border-blue-600" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image src={image.url || "/placeholder.svg"} alt={image.alt_text} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
