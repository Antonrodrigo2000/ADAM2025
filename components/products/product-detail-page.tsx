"use client"

import { useState } from "react"
import type { Product } from "@/types/product"
import { ProductImageGallery } from "./product-image-gallery"
import { ProductInfo } from "./product-info"
import { ProductTabs } from "./product-tabs"
import { RelatedProducts } from "./related-products"
import { TrustBadges } from "./trust-badges"

interface ProductDetailPageProps {
  product: Product
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">
              Home
            </a>
            <span>/</span>
            <a href="/products" className="hover:text-blue-600">
              Products
            </a>
            <span>/</span>
            <a href={`/products?category=${product.health_vertical.slug}`} className="hover:text-blue-600">
              {product.health_vertical.name}
            </a>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Images (60%) */}
            <div className="lg:col-span-3">
              <ProductImageGallery
                images={product.images}
                selectedIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
              />
              <div className="mt-6">
                <TrustBadges />
              </div>
            </div>

            {/* Right Column - Product Info (40%) */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <ProductInfo product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <ProductTabs product={product} />
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <RelatedProducts />
        </div>
      </div>
    </div>
  )
}
