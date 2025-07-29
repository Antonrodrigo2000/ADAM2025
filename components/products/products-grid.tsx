import { CategoryCard } from "./category-card"
import type { HealthVertical } from "@/types/products"

// Mock data - will be replaced with Supabase queries
const mockCategories: HealthVertical[] = [
  {
    id: "1",
    name: "Hair Loss Treatment",
    slug: "hair-loss",
    description:
      "Clinically proven treatments to prevent hair loss and promote regrowth. FDA-approved medications delivered monthly.",
    icon: "hair",
    productCount: 8,
    startingPrice: 2800,
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    id: "2",
    name: "Sexual Health",
    slug: "sexual-health",
    description:
      "Discreet treatments for erectile dysfunction and premature ejaculation. Confidential consultations with licensed physicians.",
    icon: "heart",
    productCount: 12,
    startingPrice: 3200,
    gradient: "from-red-50 to-pink-50",
  },
  {
    id: "3",
    name: "Skincare",
    slug: "skincare",
    description:
      "Medical-grade skincare solutions for acne, anti-aging, and skin health. Dermatologist-recommended formulations.",
    icon: "skin",
    productCount: 15,
    startingPrice: 2400,
    gradient: "from-green-50 to-emerald-50",
  },
]

export function ProductsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {mockCategories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}
