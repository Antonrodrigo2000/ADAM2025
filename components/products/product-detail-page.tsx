"use client"
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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <a href="/" className="hover:text-blue-600 transition-colors">
          Home
        </a>
        <span>/</span>
        <a href="/products" className="hover:text-blue-600 transition-colors">
          Products
        </a>
        <span>/</span>
        <a
          href={`/products/category/${product.health_vertical.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {product.health_vertical.name}
        </a>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        {/* Left Column - Images */}
        <div className="lg:col-span-3">
          <ProductImageGallery images={product.images} productName={product.name} />
          <div className="mt-8">
            <TrustBadges />
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="lg:col-span-2">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Tabbed Content */}
      <ProductTabs product={product} />

      {/* Related Products */}
      <RelatedProducts currentProductId={product.id} />
    </div>
  )
}
