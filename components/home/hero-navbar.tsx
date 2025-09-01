"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu, X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { createClient } from "@/lib/supabase/client"

export function HeroNavbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { state } = useCart()
  const supabase = createClient()

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

  const cartItemCount = state.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <>
      {/* Desktop Navbar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-0 md:pt-4 md:px-4 md:pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 md:rounded-2xl px-6 py-4">
            <div className="flex items-center space-x-8 flex-1">
              {/* Logo */}
              <Link
                href="/"
                className="text-2xl font-extrabold font-logo tracking-tighter uppercase text-white hover:text-white/80 transition-colors"
              >
                ADAM
              </Link>

              {/* Navigation Links - Desktop */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/questionnaire/hair-loss"
                  className="text-sm font-light text-white/90 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  Hair Loss
                </Link>
                <Link
                  href="/questionnaire/sexual-health"
                  className="text-sm font-light text-white/90 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  Sexual Health
                </Link>
                <Link
                  href="/products"
                  className="text-sm font-light text-white/90 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  Products
                </Link>
              </nav>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
              
              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                {!loading && (
                  <>
                    {user ? (
                      <Link 
                        href="/dashboard"
                        className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                      >
                        <User className="h-4 w-4" />
                      </Link>
                    ) : (
                      <>
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="sm"
                          className="text-white/90 hover:text-white hover:bg-white/10 rounded-full px-4 py-2 font-light transition-all duration-300"
                        >
                          <Link href="/login">Login</Link>
                        </Button>
                        
                        <Button 
                          asChild 
                          size="sm"
                          className="rounded-full px-6 py-2 font-medium bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-lg"
                        >
                          <Link href="/signup">Get Started</Link>
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 z-40 md:hidden">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 mx-4 rounded-2xl overflow-hidden">
            <nav className="flex flex-col">
              <Link
                href="/questionnaire/hair-loss"
                className="px-6 py-4 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hair Loss
              </Link>
              <Link
                href="/questionnaire/sexual-health"
                className="px-6 py-4 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sexual Health
              </Link>
              <Link
                href="/products"
                className="px-6 py-4 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              
              {/* Mobile Auth Section */}
              {!loading && (
                <div className="p-6 space-y-3">
                  {user ? (
                    <Link 
                      href="/dashboard"
                      className="flex items-center justify-center w-full py-3 px-4 rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Button 
                        asChild 
                        variant="ghost" 
                        className="w-full text-white/90 hover:text-white hover:bg-white/10 rounded-full py-3 font-light transition-all duration-300"
                      >
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                      </Button>
                      
                      <Button 
                        asChild 
                        className="w-full rounded-full py-3 font-medium bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-lg"
                      >
                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}