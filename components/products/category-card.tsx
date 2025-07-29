import Link from "next/link"
import type { HealthVertical } from "@/types/products"

interface CategoryCardProps {
  category: HealthVertical
}

function CategoryIcon({ type }: { type: string }) {
  switch (type) {
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
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      )
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div
      className={`group relative bg-gradient-to-br ${category.gradient} rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-white/50`}
    >
      <div className="flex flex-col h-full">
        {/* Icon and Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/80 rounded-xl text-slate-700 group-hover:text-blue-600 transition-colors">
            <CategoryIcon type={category.icon} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-slate-600">{category.productCount} treatments</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-700 mb-6 flex-grow leading-relaxed">{category.description}</p>

        {/* Pricing */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-slate-900">From LKR {category.startingPrice.toLocaleString()}</p>
          <p className="text-sm text-slate-600">per month</p>
        </div>

        {/* CTA Button */}
        <Link
          href={`/products/${category.slug}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium group-hover:bg-blue-600"
        >
          View Treatments
          <svg
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
