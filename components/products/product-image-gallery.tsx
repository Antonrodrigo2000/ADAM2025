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

  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const allImages = images.length > 0 ? images : [primaryImage].filter(Boolean)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden">
        {allImages[selectedImageIndex] ? (
          <Image
            src={allImages[selectedImageIndex].url || "/placeholder.svg"}
            alt={allImages[selectedImageIndex].alt}
            width={600}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg"></div>
              <p className="text-sm">No image available</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {allImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-colors ${
                selectedImageIndex === index ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
