"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/style/utils"
import { ShoppingCart, User } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { createClient } from "@/lib/supabase/client"

interface HeaderProps {
  variant?: "default" | "dark" | "light"
}

export function Header({ variant = "default" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { state } = useCart()
  const supabase = createClient()

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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
      <div className="container mx-auto flex h-20 items-center px-4 md:px-6">
        <div className="flex items-center space-x-8">
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
            href="/questionnaire/hair-loss"
            className={cn(
              "relative px-4 py-2 rounded-full transition-all duration-300 hover:scale-105",
              isDark || isLight 
                ? "text-gray-700 hover:text-primary hover:bg-primary/10" 
                : "text-white/90 hover:text-white hover:bg-white/20"
            )}
          >
            Hair Loss
          </Link>
          <Link
            href="/products"
            className={cn(
              "relative px-4 py-2 rounded-full transition-all duration-300 hover:scale-105",
              isDark || isLight 
                ? "text-gray-700 hover:text-primary hover:bg-primary/10" 
                : "text-white/90 hover:text-white hover:bg-white/20"
            )}
          >
            Products
          </Link>
          {/* <Link
            href="#how-it-works"
            className={cn(
              "relative px-4 py-2 rounded-full transition-all duration-300 hover:scale-105",
              isDark || isLight 
                ? "text-gray-700 hover:text-primary hover:bg-primary/10" 
                : "text-white/90 hover:text-white hover:bg-white/20"
            )}
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#how-it-works')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              })
            }}
          >
            How It Works
          </Link> */}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4 ml-auto">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={cn(
              "relative p-2.5 rounded-full transition-all duration-300 hover:scale-105",
              isDark || isLight 
                ? "text-gray-700 hover:text-primary hover:bg-primary/10" 
                : "text-white/90 hover:text-white hover:bg-white/20"
            )}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
          
          {/* Auth Buttons */}
          {!loading && (
            <>
              {user ? (
                /* Profile Button for logged-in users */
                <Link 
                  href="/dashboard"
                  className={cn(
                    "relative w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:bg-primary/20 hover:border-primary/60",
                    isDark || isLight 
                      ? "text-primary" 
                      : "text-white bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/50"
                  )}
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                /* Login & Signup for non-logged-in users */
                <>
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "rounded-full px-4 py-2 font-medium transition-all duration-300 hover:scale-105",
                      isDark || isLight 
                        ? "text-gray-700 hover:text-primary hover:bg-primary/10" 
                        : "text-white/90 hover:text-white hover:bg-white/20"
                    )}
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    size="sm"
                    className="rounded-full px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
