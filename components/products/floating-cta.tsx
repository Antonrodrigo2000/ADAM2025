"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingCart } from "lucide-react"

interface FloatingCTAProps {
  productName: string
}

export default function FloatingCTA({ productName }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const threshold = 300
      setIsVisible(scrolled > threshold)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
      <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{productName}</p>
              <p className="text-xs text-gray-600">Start your treatment</p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg"
          >
            Start Now
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
