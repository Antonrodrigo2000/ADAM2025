"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

interface RelatedProductsProps {
  currentProductId: string
}

// Sample related products data
const relatedProducts = [
  {
    id: "2",
    name: "Finasteride 1mg",
    slug: "finasteride-1mg",
    price: 3500,
    rating: 4.7,
    review_count: 892,
    image: "/placeholder.svg?height=200&width=200&text=Finasteride",
    prescription_required: true,
  },
  {
    id: "3",
    name: "Hair Growth Shampoo",
    slug: "hair-growth-shampoo",
    price: 2200,
    rating: 4.4,
    review_count: 456,
    image: "/placeholder.svg?height=200&width=200&text=Shampoo",
    prescription_required: false,
  },
  {
    id: "4",
    name: "Biotin Supplements",
    slug: "biotin-supplements",
    price: 1800,
    rating: 4.5,
    review_count: 623,
    image: "/placeholder.svg?height=200&width=200&text=Biotin",
    prescription_required: false,
  },
  {
    id: "5",
    name: "Scalp Massage Oil",
    slug: "scalp-massage-oil",
    price: 1500,
    rating: 4.3,
    review_count: 234,
    image: "/placeholder.svg?height=200&width=200&text=Oil",
    prescription_required: false,
  },
]

export function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  const filteredProducts = relatedProducts.filter((product) => product.id !== currentProductId)

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Customers Also Bought</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="aspect-square bg-gray-50 overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
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

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">LKR {product.price.toLocaleString()}</span>
                {product.prescription_required && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Rx Required</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
