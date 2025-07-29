import { CategoryCard } from "./category-card"
import type { HealthVertical } from "@/types/products"

interface ProductsGridProps {
  categories: HealthVertical[]
}

export function ProductsGrid({ categories }: ProductsGridProps) {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose your treatment category</h2>
        <p className="text-lg text-gray-600">Browse our range of clinically proven treatments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
