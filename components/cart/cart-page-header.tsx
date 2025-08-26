"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CartPageHeaderProps {
  itemCount: number
}

export function CartPageHeader({ itemCount }: CartPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
      </div>
      <p className="text-gray-600">
        {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
      </p>
    </div>
  )
}