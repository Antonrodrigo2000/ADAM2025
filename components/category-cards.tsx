import type React from "react"
import { CategoryCard } from "./category-card"

export type Category = {
  title: string
  href: string
  description: string
  pattern: React.ReactNode
}

const categories: Category[] = [
  {
    title: "Hair Loss",
    href: "/hair-loss",
    description: "Reclaim your confidence.",
    pattern: (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute h-full w-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:1rem_1rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
    ),
  },
  {
    title: "Skincare",
    href: "/skincare",
    description: "Forge your best face.",
    pattern: (
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255,255,255,0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
        }}
      />
    ),
  },
  {
    title: "Sexual Health",
    href: "/sexual-health",
    description: "Enhance your vitality.",
    pattern: (
      <div className="absolute inset-0 overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wave" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
              <path d="M 0 20 Q 10 10, 20 20 T 40 20" stroke="rgba(255,255,255,0.05)" fill="none" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave)" />
        </svg>
      </div>
    ),
  },
  {
    title: "Testosterone",
    href: "/testosterone",
    description: "Optimize your drive.",
    pattern: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    ),
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
          <CategoryCard key={category.title} category={category} />
        ))}
      </div>
    </div>
  )
}
