"use client"

import type React from "react"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Category } from "./category-cards"

export function CategoryCard({ category }: { category: Category }) {
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ref.current.style.setProperty("--mouse-x", `${x}px`)
    ref.current.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <Link
      href={category.href}
      ref={ref}
      onMouseMove={handleMouseMove}
      className="group relative block p-px overflow-hidden rounded-2xl"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundImage: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), hsl(var(--primary)), transparent 80%)`,
        }}
      />

      <div className="relative h-40 w-full rounded-[15px] p-6 flex flex-col justify-between overflow-hidden bg-neutral-950/80 backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-colors duration-300">
        <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-500 scale-125 group-hover:scale-100 ease-in-out">
          {category.pattern}
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold font-display text-white">{category.title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{category.description}</p>
        </div>

        <div className="relative z-10 flex justify-end">
          <div className="p-2 rounded-full bg-black/30 group-hover:bg-black/50 transition-colors">
            <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  )
}
