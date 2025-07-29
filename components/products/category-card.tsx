import Link from "next/link"
import type { HealthVertical } from "@/types/products"

interface CategoryCardProps {
  category: HealthVertical
}

export function CategoryCard({ category }: CategoryCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "hair":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
      case "heart":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )
      case "skin":
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`bg-gradient-to-br ${category.gradient} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer`}
    >
      <Link href={`/products/${category.slug}`}>
        <div className="flex flex-col h-full">
          {/* Icon and Title */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-700 group-hover:scale-110 transition-transform duration-300">
              {getIcon(category.icon)}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.productCount} treatments</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 flex-grow leading-relaxed">{category.description}</p>

          {/* Pricing and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Starting from</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {category.basePrice.toLocaleString()}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </p>
            </div>
            <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-sm">
              View Treatments
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}
