"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

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

const healthVerticals = [
  {
    id: "hair-loss",
    title: "Hair Loss Treatment",
    subtitle: "Regain Your Confidence",
    description: "Stop hair loss and regrow your hair with clinically-proven treatments prescribed by licensed doctors.",
    cta: "Start Treatment",
    href: "/questionnaire/hair-loss",
    apiCategory: "hair-loss",
    image: "/hair-loss.jpg",
    bgGradient: "from-orange-50 to-amber-50"
  },
  {
    id: "sexual-health", 
    title: "Sexual Health Solutions",
    subtitle: "Restore Your Performance",
    description: "Discreet and effective treatments for erectile dysfunction and performance issues, prescribed by licensed physicians.",
    cta: "Get Started",
    href: "/questionnaire/sexual-health", 
    apiCategory: "sexual-health",
    image: "/sexual-health-hero.jpg",
    bgGradient: "from-blue-50 to-indigo-50"
  }
]

export function HealthVerticalsSection() {
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const results: { [key: string]: Product[] } = {}
        
        for (const vertical of healthVerticals) {
          try {
            const response = await fetch(`/api/products-list?categoryId=${vertical.apiCategory}`)
            if (response.ok) {
              const data = await response.json()
              if (data.products && data.products.length > 0) {
                results[vertical.id] = data.products.slice(0, 3)
              }
            }
          } catch (error) {
            console.error(`Error fetching ${vertical.id} products:`, error)
          }
        }
        
        setProducts(results)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching products:', error)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div id="health-verticals">
      {healthVerticals.map((vertical, index) => (
        <section 
          key={vertical.id}
          className={`py-16 md:py-24 ${index > 0 ? 'border-t border-gray-100' : ''}`}
        >
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 md:gap-16 items-start">
                {/* Content */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="space-y-6">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
                      <span className="text-sm font-medium text-primary">{vertical.title}</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      {vertical.title.split(' ')[0]} {vertical.title.split(' ')[1]} <span className="text-gray-500">{vertical.title.split(' ').slice(2).join(' ')}</span>
                    </h2>
                    
                    <p className="text-xl text-gray-600 font-light leading-relaxed">
                      {vertical.description}
                    </p>
                  </div>

                  <a 
                    href={vertical.href}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    {vertical.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                {/* Products */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">Popular Treatments</h3>
                    <p className="text-sm text-gray-500">Clinically proven solutions</p>
                  </div>
                  
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(products[vertical.id] || []).slice(0, 3).map((product) => (
                        <div key={product.id} className="bg-gray-50/50 rounded-xl p-4 hover:bg-gray-50 transition-colors group">
                          <a href={`/products/${product.id}`} className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                              {product.primary_image ? (
                                <Image
                                  src={product.primary_image}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="text-base font-medium text-gray-400">
                                  {product.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate mb-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-500 truncate mb-2">
                                {product.active_ingredient}
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-semibold text-gray-900">
                                  LKR {product.price.toFixed(0)}
                                </span>
                                <span className="text-xs text-gray-400">/mo</span>
                              </div>
                            </div>
                            
                            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <a 
                    href={`/products?category=${vertical.apiCategory}`}
                    className="block text-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all group"
                  >
                    View All {vertical.title} Products
                    <ArrowRight className="inline h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}