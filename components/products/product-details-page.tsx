"use client"

import { useState } from "react"
import type { Product } from "@/data/types/product"
import { ProductImageGallery } from "./product-image-gallery"
import { ProductInfo } from "./product-info"
import { ProductTabs } from "./product-tabs"
import { RelatedProducts } from "./related-products"
import { RecommendationBanner } from "./recommendation-banner"

interface ProductDetailPageProps {
    product: Product
    isRecommended?: boolean
}

export function ProductDetailPage({ product, isRecommended = false }: ProductDetailPageProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    return (
        <div className="pt-20 bg-gray-50 min-h-screen">
            {/* Recommendation Banner */}
            {isRecommended && (
                <RecommendationBanner productName={product.name} />
            )}

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center text-sm text-gray-600 overflow-x-auto">
                        <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                            <a href="/" className="hover:text-blue-600 transition-colors flex items-center">
                                <span className="hidden sm:inline">Home</span>
                                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </a>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <a href="/products" className="hover:text-blue-600 transition-colors hidden sm:inline">
                                Products
                            </a>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <a
                                href={`/products?category=${product.health_vertical.slug}`}
                                className="hover:text-blue-600 transition-colors truncate max-w-[100px] sm:max-w-none"
                            >
                                {product.health_vertical.name}
                            </a>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Product Section */}
            <div className="bg-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
                        {/* Left Column - Images */}
                        <div className="lg:col-span-2 xl:col-span-3">
                            <ProductImageGallery
                                images={product.images}
                                selectedIndex={selectedImageIndex}
                                onImageSelect={setSelectedImageIndex}
                            />
                        </div>

                        {/* Right Column - Product Info */}
                        <div className="lg:col-span-1 xl:col-span-2">
                            <div className="lg:sticky lg:top-24">
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
