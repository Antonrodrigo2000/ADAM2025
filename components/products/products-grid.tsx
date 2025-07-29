import { CategoryCard } from "./category-card"
import type { HealthVertical } from "@/types/products"

// Mock data - will be replaced with Supabase data
const healthVerticals: HealthVertical[] = [
  {
    id: "1",
    name: "Hair Loss Treatment",
    slug: "hair-loss",
    description:
      "Clinically proven treatments to prevent hair loss and promote regrowth. FDA-approved medications delivered discreetly.",
    icon: "hair",
    pricing_from: 2800,
    product_count: 8,
    gradient_from: "from-blue-50",
    gradient_to: "to-indigo-100",
  },
  {
    id: "2",
    name: "Sexual Health",
    slug: "sexual-health",
    description:
      "Confidential consultations and effective treatments for erectile dysfunction and premature ejaculation.",
    icon: "sexual-health",
    pricing_from: 3200,
    product_count: 6,
    gradient_from: "from-emerald-50",
    gradient_to: "to-teal-100",
  },
  {
    id: "3",
    name: "Skincare",
    slug: "skincare",
    description: "Professional-grade skincare solutions for acne, anti-aging, and skin health maintenance.",
    icon: "skincare",
    pricing_from: 2400,
    product_count: 12,
    gradient_from: "from-orange-50",
    gradient_to: "to-amber-100",
  },
]

export function ProductsGrid() {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose your health vertical</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the area you'd like to focus on. Our licensed physicians will provide personalized treatment plans
          tailored to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {healthVerticals.map((vertical) => (
          <CategoryCard key={vertical.id} vertical={vertical} />
        ))}
      </div>
    </div>
  )
}
