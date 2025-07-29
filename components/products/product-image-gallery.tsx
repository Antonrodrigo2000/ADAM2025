"use client"

import { useState } from "react"
import Image from "next/image"
import type { ProductImage } from "@/types/product"

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Image
          src={images[selectedImage]?.url || "/placeholder.svg?height=500&width=500"}
          alt={images[selectedImage]?.alt || productName}
          width={500}
          height={500}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square bg-white border rounded-lg overflow-hidden transition-all ${
                selectedImage === index
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
