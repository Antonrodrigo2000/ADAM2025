"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { ProductImage } from "@/data/types/product"

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
      <Card className="relative aspect-square overflow-hidden group border shadow-sm">
        <div className="relative w-full h-full bg-gray-50">
          <Image
            src={images[selectedIndex]?.url || "/placeholder.svg"}
            alt={images[selectedIndex]?.alt_text || "Product image"}
            fill
            className={`object-cover transition-transform duration-300 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
          
          {/* Zoom Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomed(!isZoomed)
            }}
          >
            {isZoomed ? <ZoomOut className="h-4 w-4 text-gray-700" /> : <ZoomIn className="h-4 w-4 text-gray-700" />}
          </Button>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white hover:shadow-xl"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white hover:shadow-xl"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        <Badge
          variant="secondary"
          className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg text-gray-700"
        >
          {selectedIndex + 1} / {images.length}
        </Badge>
      </Card>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => onImageSelect(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? "border-blue-500 ring-2 ring-blue-200/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image 
                src={image.url || "/placeholder.svg"} 
                alt={image.alt_text} 
                fill 
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
