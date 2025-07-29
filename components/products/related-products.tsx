"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

const relatedProducts = [
  {
    id: "2",
    name: "Finasteride 1mg Tablets",
    slug: "finasteride-1mg",
    price: 3200,
    rating: 4.5,
    review_count: 892,
    image: "/placeholder.svg?height=200&width=200&text=Finasteride",
    category: "Hair Loss",
  },
  {
    id: "3",
    name: "Hair Growth Shampoo",
    slug: "hair-growth-shampoo",
    price: 1800,
    rating: 4.3,
    review_count: 456,
    image: "/placeholder.svg?height=200&width=200&text=Shampoo",
    category: "Hair Loss",
  },
  {
    id: "4",
    name: "Biotin Supplements",
    slug: "biotin-supplements",
    price: 2400,
    rating: 4.4,
    review_count: 623,
    image: "/placeholder.svg?height=200&width=200&text=Biotin",
    category: "Hair Loss",
  },
  {
    id: "5",
    name: "Scalp Massage Oil",
    slug: "scalp-massage-oil",
    price: 1500,
    rating: 4.2,
    review_count: 234,
    image: "/placeholder.svg?height=200&width=200&text=Oil",
    category: "Hair Loss",
  },
]

export function RelatedProducts() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Customers Also Bought</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-gray-100 rounded-3xl overflow-hidden shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)] transition-all duration-300"
          >
            {/* Product Image - Neumorphic Container */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden m-4 rounded-2xl shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
              <div className="absolute inset-2 bg-white rounded-xl overflow-hidden shadow-[2px_2px_4px_rgba(0,0,0,0.05)]">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 pt-0">
              <div className="text-xs text-blue-600 font-medium mb-2 bg-blue-100 px-2 py-1 rounded-full inline-block shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
                {product.category}
              </div>

              <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">({product.review_count})</span>
              </div>

              <div className="bg-white rounded-xl p-3 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)]">
                <div className="font-semibold text-gray-900">LKR {product.price.toLocaleString()}/month</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
