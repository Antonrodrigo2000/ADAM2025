"use client"

import { useEffect, useState, useCallback } from "react"
import { ProductCard } from "@/components/products/product-card"
import { ProductsFilter } from "@/components/products/products-filter"
import { MobileFilterModal } from "@/components/products/mobile-filter-modal"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, SlidersHorizontal } from "lucide-react"

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

interface ProductsResponse {
  products: Product[]
  count: number
  filters: {
    categoryId?: string | null
    name?: string | null
    sku?: string | null
  }
}

interface ProductsListingProps {
  categoryFilter?: string
  isRecommended?: boolean
}

// Category slugs will be mapped to Genie category IDs by the API

export function ProductsListing({ categoryFilter, isRecommended }: ProductsListingProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        
        // Pass category filter directly - API will handle mapping to Genie category IDs
        if (categoryFilter) {
          params.set('categoryId', categoryFilter)
        }

        const response = await fetch(`/api/products-list?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`)
        }

        const data: ProductsResponse = await response.json()
        setProducts(data.products)
        setFilteredProducts(data.products)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryFilter])

  // Filter products based on category
  useEffect(() => {
    if (!categoryFilter) {
      setFilteredProducts(products)
      return
    }

    // For now, filter by health vertical slug since we don't have Genie category IDs mapped yet
    const filtered = products.filter(product => 
      product.health_vertical?.slug === categoryFilter ||
      product.category.name.toLowerCase().includes(categoryFilter.replace('-', ' '))
    )
    
    setFilteredProducts(filtered)
  }, [products, categoryFilter])

  // Handle filter changes and count active filters
  const handleFilterChange = useCallback((filtered: Product[]) => {
    setFilteredProducts(filtered)
    // Count active filters could be implemented by the filter component
    // For now, just set a basic count based on filtered vs total
    const isFiltered = filtered.length !== products.length
    setActiveFiltersCount(isFiltered ? 1 : 0)
  }, [products.length])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Mobile Filter Button - Show only on mobile */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
          <MobileFilterModal 
            products={products}
            onFilterChange={handleFilterChange}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <ProductsFilter 
            products={products}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
              <p className="text-muted-foreground">
                {categoryFilter 
                  ? `No products found in this category.`
                  : 'No products available at the moment.'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Results header - Hidden on mobile */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              {/* Products grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    isRecommended={isRecommended}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}