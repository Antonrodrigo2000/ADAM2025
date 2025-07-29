"use client"

import { useState } from "react"
import Image from "next/image"
import type { ProductImage } from "@/types/product"

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const primaryImage = images.find((img) => img.is_primary) || images[0]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <Image
          src={images[selectedImage]?.url || primaryImage.url}
          alt={images[selectedImage]?.alt_text || primaryImage.alt_text}
          width={600}
          height={600}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all duration-200 ${
              selectedImage === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.alt_text}
              width={150}
              height={150}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
