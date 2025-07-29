"use client"

import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import type { Product } from "@/types/product"

interface RelatedProductsProps {
  products: Product[]
}

// Mock related products
const mockRelatedProducts: Product[] = [
  {
    id: "2",
    name: "Finasteride 1mg",
    slug: "finasteride-1mg",
    description: "Prescription hair loss treatment",
    price: 3500,
    rating: 4.5,
    review_count: 892,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=200&width=200&text=Finasteride",
        alt: "Finasteride tablets",
        is_primary: true,
      },
    ],
  } as Product,
  {
    id: "3",
    name: "Hair Growth Shampoo",
    slug: "hair-growth-shampoo",
    description: "Caffeine-infused strengthening shampoo",
    price: 2200,
    rating: 4.3,
    review_count: 456,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=200&width=200&text=Shampoo",
        alt: "Hair growth shampoo",
        is_primary: true,
      },
    ],
  } as Product,
]

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const displayProducts = products.length > 0 ? products : mockRelatedProducts

  if (displayProducts.length === 0) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Customers also bought</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.slice(0, 3).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-50 rounded-lg mb-4 overflow-hidden">
              <Image
                src={product.images[0]?.url || "/placeholder.svg?height=200&width=200"}
                alt={product.images[0]?.alt || product.name}
                width={200}
                height={200}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.review_count})</span>
            </div>

            <p className="font-semibold text-gray-900">LKR {product.price.toLocaleString()}/month</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
