"use client"

import Link from "next/link"
import { cn } from "@/utils/style/utils"

interface CheckoutHeaderProps {
  variant?: "default" | "light"
}

export function CheckoutHeader({ variant = "default" }: CheckoutHeaderProps) {
  const isLight = variant === "light"

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 border-b",
        isLight
          ? "bg-white border-gray-200"
          : "bg-white border-gray-200"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-center px-4 md:px-6">
        <Link
          href="/"
          className={cn(
            "text-2xl font-extrabold font-logo tracking-tighter uppercase",
            "text-black hover:text-gray-800 transition-colors"
          )}
        >
          ADAM
        </Link>
      </div>
    </header>
  )
}