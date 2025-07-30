"use client"

import Image from "next/image"

interface RelatedProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
}

const relatedProducts: RelatedProduct[] = [
  {
    id: "1",
    name: "Hair Growth Shampoo",
    price: 2800,
    image: "/placeholder.svg?height=200&width=200",
    category: "Hair Loss",
  },
  {
    id: "2",
    name: "Scalp Treatment Serum",
    price: 3500,
    image: "/placeholder.svg?height=200&width=200",
    category: "Hair Loss",
  },
  {
    id: "3",
    name: "DHT Blocker Supplement",
    price: 4200,
    image: "/placeholder.svg?height=200&width=200",
    category: "Hair Loss",
  },
  {
    id: "4",
    name: "Hair Vitamins Complex",
    price: 3800,
    image: "/placeholder.svg?height=200&width=200",
    category: "Hair Loss",
  },
]

export function RelatedProducts() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Customers also bought</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-100 rounded-2xl p-4 shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.9)] transition-all duration-300 cursor-pointer group"
          >
            {/* Product Image */}
            <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4 shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.9)]">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <div className="text-xs text-blue-600 font-medium">{product.category}</div>
              <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">LKR {product.price.toLocaleString()}</span>
                <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-[2px_2px_4px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.25),-1px_-1px_2px_rgba(255,255,255,0.15)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.1)] transition-all duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
