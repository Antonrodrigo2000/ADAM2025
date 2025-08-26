"use client"

import { Header } from "@/components/layout/header"
import { CartContent } from "@/components/cart/cart-content"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation Header */}
      <Header variant="light" />
      
      {/* Cart Content */}
      <div className="pt-20">
        <CartContent />
      </div>
    </div>
  )
}