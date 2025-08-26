"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

export function EmptyCartPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Looks like you haven't added any items to your cart yet. Start shopping to find your perfect products.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/products')}
            className="w-full sm:w-auto px-8 py-3 text-lg bg-orange-500 hover:bg-orange-600"
            size="lg"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Browse Products
          </Button>
          
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}