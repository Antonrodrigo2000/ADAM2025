import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import type { Product } from "@/types/product"

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  // Mock related products if none provided
  const mockProducts: Product[] = [
    {
      id: "2",
      name: "Finasteride 1mg Tablets",
      slug: "finasteride-1mg",
      description: "Oral medication for hair loss prevention",
      active_ingredient: "Finasteride 1mg",
      dosage: "Take 1 tablet daily",
      price: 3200,
      consultation_fee: 2000,
      prescription_required: true,
      health_vertical_id: "1",
      health_vertical: { name: "Hair Loss", slug: "hair-loss" },
      images: [
        {
          id: "1",
          url: "/placeholder.svg?height=300&width=300&text=Finasteride",
          alt: "Finasteride tablets",
          is_primary: true,
        },
      ],
      rating: 4.4,
      review_count: 892,
      benefits: [],
      how_it_works: "",
      expected_timeline: "",
      ingredients: [],
      side_effects: [],
      contraindications: [],
      warnings: [],
      faqs: [],
    },
    {
      id: "3",
      name: "Hair Growth Shampoo",
      slug: "hair-growth-shampoo",
      description: "Strengthening shampoo with biotin and caffeine",
      active_ingredient: "Biotin, Caffeine",
      dosage: "Use 2-3 times per week",
      price: 1800,
      consultation_fee: 0,
      prescription_required: false,
      health_vertical_id: "1",
      health_vertical: { name: "Hair Loss", slug: "hair-loss" },
      images: [
        {
          id: "1",
          url: "/placeholder.svg?height=300&width=300&text=Shampoo",
          alt: "Hair growth shampoo",
          is_primary: true,
        },
      ],
      rating: 4.2,
      review_count: 456,
      benefits: [],
      how_it_works: "",
      expected_timeline: "",
      ingredients: [],
      side_effects: [],
      contraindications: [],
      warnings: [],
      faqs: [],
    },
  ]

  const displayProducts = products.length > 0 ? products : mockProducts

  if (displayProducts.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customers also bought</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.slice(0, 3).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <Image
                src={product.images[0]?.url || "/placeholder.svg?height=200&width=200"}
                alt={product.images[0]?.alt || product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">LKR {product.price.toLocaleString()}</span>
              {product.prescription_required && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Prescription</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
