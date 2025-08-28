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
          className={`py-12 md:py-20 ${index > 0 ? 'border-t border-gray-200' : ''}`}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {/* Content */}
                <div className="space-y-6 md:space-y-8">
                  <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-primary/20">
                    {vertical.title}
                  </Badge>
                  
                  <div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold font-logo tracking-tighter mb-4 md:mb-6 text-gray-900">
                      {vertical.title.split(' ')[0]} {vertical.title.split(' ')[1]}
                      <br />
                      <span className="text-primary">
                        {vertical.title.split(' ').slice(2).join(' ')}
                      </span>
                    </h2>
                    
                    <p className="text-lg md:text-xl text-primary font-semibold mb-4 md:mb-6">
                      {vertical.subtitle}
                    </p>
                    
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6 md:mb-8">
                      {vertical.description}
                    </p>
                  </div>

                  <a 
                    href={vertical.href}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold text-white hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                  >
                    {vertical.cta}
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </a>
                </div>

                {/* Products */}
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Popular Treatments</h3>
                    <p className="text-sm md:text-base text-gray-600">Clinically proven solutions</p>
                  </div>
                  
                  {loading ? (
                    <div className="grid gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse shadow-sm">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 md:gap-4">
                      {(products[vertical.id] || []).slice(0, 3).map((product) => (
                        <div key={product.id} className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 hover:shadow-sm transition-shadow overflow-hidden">
                          <a href={`/products/${product.id}`} className="flex gap-3 items-center group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {product.primary_image ? (
                                <Image
                                  src={product.primary_image}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="text-sm md:text-base font-bold text-gray-400">
                                  {product.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0 pr-2">
                              <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-600 mb-1 truncate">
                                {product.active_ingredient}
                              </p>
                              <div className="flex items-center gap-1">
                                <span className="text-sm md:text-base font-bold text-gray-900">
                                  LKR {product.price.toFixed(0)}
                                </span>
                                <span className="text-xs text-gray-500">/mo</span>
                              </div>
                            </div>
                            
                            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <a 
                    href={`/products?category=${vertical.apiCategory}`}
                    className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    View All {vertical.title} Products
                    <ArrowRight className="h-4 w-4" />
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