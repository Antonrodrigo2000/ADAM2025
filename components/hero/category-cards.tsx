import { CategoryCard } from "./category-card"

export type Category = {
  title: string
  href: string
  description: string
}

const categories: Category[] = [
  {
    title: "Hair Loss",
    href: "/quiz", // Changed from "/hair-loss" to "/quiz"
    description: "Reclaim your confidence.",
  },
  {
    title: "Skincare",
    href: "/skincare",
    description: "Forge your best face.",
  },
  {
    title: "Sexual Health",
    href: "/sexual-health",
    description: "Enhance your vitality.",
  },
  {
    title: "Testosterone",
    href: "/testosterone",
    description: "Optimize your drive.",
  },
]

export function CategoryCards() {
  return (
    <div
      className="w-full max-w-6xl mx-auto animate-content-in opacity-0"
      style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {categories.map((category) => (
          <CategoryCard key={category.title} category={category} isFeatured={category.title === "Hair Loss"} />
        ))}
      </div>
    </div>
  )
}
