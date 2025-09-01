"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number
  primary_image: string | null
  images: Array<{
    id: string
    url: string
    alt_text: string
    is_primary: boolean
  }>
  category: {
    id: string
    name: string
    description: string
  }
  health_vertical: {
    name: string
    slug: string
  } | null
  rating: number
  review_count: number
  consultation_required: boolean
  consultation_fee: number
  product_type: 'normal' | 'consultation_required' | 'consultation_adhoc'
  is_adhoc_quantity: boolean
  active_ingredient: string
  dosage: string
  benefits: string[]
  in_stock: boolean
}

interface RelatedProductsProps {
  currentProduct: Product
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!currentProduct.health_vertical?.slug) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/products-list?categoryId=${currentProduct.health_vertical.slug}`)
        if (response.ok) {
          const data = await response.json()
          if (data.products) {
            // Filter out current product and limit to 4 products
            const filtered = data.products
              .filter((product: Product) => product.id !== currentProduct.id)
              .slice(0, 4)
            setRelatedProducts(filtered)
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProduct.id, currentProduct.health_vertical?.slug])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Customers also bought</h2>
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="md:hidden flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-none w-72 bg-gray-100 rounded-2xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Customers also bought</h2>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {relatedProducts.map((product) => (
            <div key={product.id} className="flex-none w-72" style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}