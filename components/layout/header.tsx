"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/contexts/cart-context"
import { CartSidebar } from "@/components/cart/cart-sidebar"

interface HeaderProps {
  variant?: "default" | "dark" | "light"
}

export function Header({ variant = "default" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { state } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isDark = variant === "dark"
  const isLight = variant === "light"
  const cartItemCount = state.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300",
        isDark
          ? "bg-white/95 backdrop-blur-sm border-b border-gray-200"
          : isLight
            ? "bg-white/95 backdrop-blur-sm border-b border-gray-200"
            : scrolled
              ? "bg-black/80 backdrop-blur-sm"
              : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className={cn(
            "text-2xl font-extrabold font-logo tracking-tighter uppercase",
            isDark || isLight ? "text-black" : "text-white",
          )}
        >
          ADAM
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/products/minoxidil-5-solution"
            className={cn("hover:text-blue-600 transition-colors", isDark || isLight ? "text-gray-700" : "text-white")}
          >
            Hair Loss
          </Link>
          <Link
            href="/products/minoxidil-finasteride-combination-spray"
            className={cn("hover:text-blue-600 transition-colors", isDark || isLight ? "text-gray-700" : "text-white")}
          >
            Skincare
          </Link>
          <Link
            href="#sexual-health"
            className={cn("hover:text-blue-600 transition-colors", isDark || isLight ? "text-gray-700" : "text-white")}
          >
            Sexual Health
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={cn(
              "relative p-2 rounded-full transition-colors",
              isDark || isLight 
                ? "text-gray-700 hover:text-blue-600 hover:bg-gray-100" 
                : "text-white hover:text-blue-400 hover:bg-white/10"
            )}
          >
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
          
          {/* Get Started Button - only show if cart is empty */}
          {cartItemCount === 0 && (
            <Button asChild variant={isDark || isLight ? "default" : "ghost"} className="rounded-full">
              <Link href="/auth">Get Started</Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
