"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Shield, Truck, ChevronRight } from "lucide-react"
import type { Product } from "@/types/product"
import ProductImageGallery from "./product-image-gallery"
import ProductTabs from "./product-tabs"
import ProductFAQ from "./product-faq"
import RelatedProducts from "./related-products"
import TrustBadges from "./trust-badges"

interface ProductDetailViewProps {
  product: Product
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const quantityOptions = [
    { months: 1, price: product.price, savings: 0, label: "1 Month Supply" },
    { months: 3, price: product.price * 3 * 0.9, savings: 10, label: "3 Month Supply" },
    { months: 6, price: product.price * 6 * 0.8, savings: 20, label: "6 Month Supply" },
  ]

  const selectedOption = quantityOptions[selectedQuantity - 1]
  const totalFirstOrder = selectedOption.price + (product.prescription_required ? product.consultation_fee : 0)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    // TODO: Implement cart functionality
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAddingToCart(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Products
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/products?category=${product.health_vertical.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {product.health_vertical.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        {/* Left Column - Images (60%) */}
        <div className="lg:col-span-3">
          <ProductImageGallery images={product.images} productName={product.name} />
          <div className="mt-6">
            <TrustBadges />
          </div>
        </div>

        {/* Right Column - Product Info (40%) */}
        <div className="lg:col-span-2">
          <div className="sticky top-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.review_count.toLocaleString()} reviews)
              </span>
            </div>

            {/* Prescription Badge */}
            {product.prescription_required && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <Shield className="w-4 h-4 mr-1" />
                Prescription Required
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>

              {/* Quantity Selector */}
              <div className="space-y-3 mb-4">
                {quantityOptions.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedQuantity === index + 1
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="quantity"
                        value={index + 1}
                        checked={selectedQuantity === index + 1}
                        onChange={() => setSelectedQuantity(index + 1)}
                        className="sr-only"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        {option.savings > 0 && <div className="text-sm text-green-600">Save {option.savings}%</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">LKR {option.price.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        LKR {Math.round(option.price / option.months).toLocaleString()}/month
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Product price:</span>
                  <span>LKR {selectedOption.price.toLocaleString()}</span>
                </div>
                {product.prescription_required && (
                  <div className="flex justify-between text-sm">
                    <span>Consultation fee (one-time):</span>
                    <span>LKR {product.consultation_fee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total first order:</span>
                  <span>LKR {totalFirstOrder.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
              </button>

              {product.prescription_required && (
                <button className="w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Book Consultation First
                </button>
              )}
            </div>

            {/* Delivery Info */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <Truck className="w-5 h-5 mr-2" />
                <span className="font-medium">Free 2-day delivery in Colombo</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Order before 2 PM for next-day processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <ProductTabs product={product} />

      {/* FAQ Section */}
      <ProductFAQ faqs={product.faqs} />

      {/* Related Products */}
      <RelatedProducts products={product.related_products || []} />
    </div>
  )
}
