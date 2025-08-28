"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/products/product-card"
import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number
  primary_image: string | null
  images: Array<{
    id: string
    url: string
    alt_text: string
    is_primary: boolean
  }>
  category: {
    id: string
    name: string
    description: string
  }
  health_vertical: {
    name: string
    slug: string
  } | null
  rating: number
  review_count: number
  consultation_required: boolean
  consultation_fee: number
  active_ingredient: string
  dosage: string
  benefits: string[]
  in_stock: boolean
}

export function ProductsSlider() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products for both health verticals
        const [hairLossResponse, sexualHealthResponse] = await Promise.all([
          fetch('/api/products-list?categoryId=hair-loss'),
          fetch('/api/products-list?categoryId=sexual-health')
        ])
        
        let allProducts: Product[] = []
        
        // Process hair loss products
        if (hairLossResponse.ok) {
          const hairLossData = await hairLossResponse.json()
          if (hairLossData.products && hairLossData.products.length > 0) {
            allProducts.push(...hairLossData.products.slice(0, 3))
          }
        }
        
        // Process sexual health products
        if (sexualHealthResponse.ok) {
          const sexualHealthData = await sexualHealthResponse.json()
          if (sexualHealthData.products && sexualHealthData.products.length > 0) {
            allProducts.push(...sexualHealthData.products.slice(0, 3))
          }
        }
        
        if (allProducts.length > 0) {
          setProducts(allProducts)
          setLoading(false)
          return
        }
        
        // Fallback to mock data if API fails
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Minoxidil 5% Solution",
            slug: "minoxidil-5-solution", 
            description: "Clinically proven hair growth treatment",
            price: 2500,
            originalPrice: 3000,
            primary_image: null,
            images: [],
            category: {
              id: "1",
              name: "Hair Loss",
              description: "Hair loss treatments"
            },
            health_vertical: {
              name: "Hair Loss",
              slug: "hair-loss"
            },
            rating: 4.6,
            review_count: 89,
            consultation_required: true,
            consultation_fee: 1000,
            active_ingredient: "Minoxidil 5%",
            dosage: "Apply twice daily",
            benefits: ["Stops hair loss", "Promotes regrowth", "Clinically proven"],
            in_stock: true
          },
          {
            id: "2",
            name: "Finasteride 1mg Tablets", 
            slug: "finasteride-1mg",
            description: "DHT blocker for male pattern baldness",
            price: 3200,
            originalPrice: 3200,
            primary_image: null,
            images: [],
            category: {
              id: "1", 
              name: "Hair Loss",
              description: "Hair loss treatments"
            },
            health_vertical: {
              name: "Hair Loss",
              slug: "hair-loss"
            },
            rating: 4.8,
            review_count: 67,
            consultation_required: true,
            consultation_fee: 1000,
            active_ingredient: "Finasteride 1mg",
            dosage: "One tablet daily",
            benefits: ["Blocks DHT", "Prevents further loss", "Clinically proven"],
            in_stock: true
          },
          {
            id: "3",
            name: "Performance Enhancement Kit",
            slug: "performance-kit",
            description: "Comprehensive solution for performance issues",
            price: 3800,
            originalPrice: 4500,
            primary_image: null,
            images: [],
            category: {
              id: "2",
              name: "Sexual Health", 
              description: "Sexual health treatments"
            },
            health_vertical: {
              name: "Sexual Health",
              slug: "sexual-health"
            },
            rating: 4.5,
            review_count: 45,
            consultation_required: true,
            consultation_fee: 1000,
            active_ingredient: "Sildenafil/Tadalafil",
            dosage: "As prescribed",
            benefits: ["Fast-acting", "Long-lasting", "Discreet treatment"],
            in_stock: true
          }
        ]
        
        setProducts(mockProducts)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev === products.length - 1 ? 0 : prev + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? products.length - 1 : prev - 1
    )
  }

  const visibleProducts = () => {
    const visible = []
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const index = (currentIndex + i) % products.length
      visible.push(products[index])
    }
    return visible
  }

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Popular Products</h2>
            <p className="text-xl text-gray-600">Our most trusted treatments</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || products.length === 0) {
    return null
  }

  return (
    <section 
      className="py-20 md:py-32 relative transition-all duration-1000"
      style={{
        background: scrollY > 1400 
          ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'
      }}
    >
      {/* Dynamic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl transition-all duration-1000"
          style={{
            background: scrollY > 1400 
              ? 'rgba(249,115,22,0.08)' 
              : 'rgba(249,115,22,0.05)',
            transform: `translateY(${(scrollY - 1400) * 0.1}px)`
          }}
        />
        <div 
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl transition-all duration-1000"
          style={{
            background: scrollY > 1400 
              ? 'rgba(234,88,12,0.1)' 
              : 'rgba(234,88,12,0.06)',
            transform: `translateY(${-(scrollY - 1400) * 0.08}px)`
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-4 transition-colors duration-1000"
              style={{
                backgroundImage: scrollY > 1400
                  ? 'linear-gradient(135deg, #1f2937 0%, #f97316 50%, #1f2937 100%)'
                  : 'linear-gradient(135deg, #374151 0%, #f97316 50%, #374151 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Popular Products
            </h2>
            <p 
              className="text-xl mb-8 transition-colors duration-1000"
              style={{
                color: scrollY > 1400 ? '#4b5563' : '#6b7280'
              }}
            >
              Trusted treatments, backed by science
            </p>
            <Button asChild variant="outline" className="rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300">
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Products Slider */}
          <div className="relative">
            {/* Navigation Buttons */}
            {products.length > 3 && (
              <>
                <Button
                  onClick={prevSlide}
                  variant="outline"
                  size="icon"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg bg-white hover:bg-gray-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={nextSlide}
                  variant="outline"
                  size="icon"
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg bg-white hover:bg-gray-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Products Grid */}
            <div className="grid md:grid-cols-3 gap-6 transition-all duration-300">
              {visibleProducts().map((product, index) => (
                <div 
                  key={`${product.id}-${currentIndex}-${index}`}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <ProductCard product={product} isRecommended={index === 1} />
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            {products.length > 3 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: products.length }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-blue-600 w-6' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}