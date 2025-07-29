"use client"

import { useState } from "react"
import Image from "next/image"
import type { ProductImage } from "@/types/product"

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <Image
          src={images[selectedImageIndex]?.url || "/placeholder.svg?height=500&width=500"}
          alt={images[selectedImageIndex]?.alt || productName}
          width={500}
          height={500}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt}
                width={120}
                height={120}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
