"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: {
    id: string
    name: string
    description: string
  }
  health_vertical: {
    name: string
    slug: string
  } | null
  active_ingredient: string
  in_stock: boolean
}

interface ProductsFilterProps {
  products: Product[]
  onFilterChange: (filteredProducts: Product[]) => void
}

interface FilterState {
  categories: string[]
  healthVerticals: string[]
  priceRange: {
    min: number | null
    max: number | null
  }
  inStockOnly: boolean
}

export function ProductsFilter({ products, onFilterChange }: ProductsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    healthVerticals: [],
    priceRange: { min: null, max: null },
    inStockOnly: false
  })

  // Get current category from URL
  const currentCategory = searchParams.get('category')

  // Extract unique values for filter options
  const categories = Array.from(new Set(products.map(p => p.category.name))).sort()
  const healthVerticals = Array.from(new Set(
    products.map(p => p.health_vertical?.name).filter(Boolean)
  )).sort() as string[]

  // Debug logging
  console.log('🔍 Filter Debug:', {
    productsCount: products.length,
    categories,
    healthVerticals,
    sampleProduct: products[0]
  })
  
  const priceRange = {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  }

  // Apply filters
  useEffect(() => {
    let filtered = products

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        filters.categories.includes(product.category.name)
      )
    }

    // Health vertical filter
    if (filters.healthVerticals.length > 0) {
      filtered = filtered.filter(product =>
        product.health_vertical && filters.healthVerticals.includes(product.health_vertical.name)
      )
    }

    // Price range filter
    if (filters.priceRange.min !== null) {
      filtered = filtered.filter(product => product.price >= filters.priceRange.min!)
    }
    if (filters.priceRange.max !== null) {
      filtered = filtered.filter(product => product.price <= filters.priceRange.max!)
    }

    // Stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.in_stock)
    }

    onFilterChange(filtered)
  }, [filters, products]) // Removed onFilterChange from dependencies to prevent infinite loop

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Handle category selection with URL updates
  const handleCategoryChange = (categoryName: string) => {
    // Map category name to URL slug
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-')
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (currentCategory === categorySlug) {
      // Deselect - remove from URL to show all products
      params.delete('category')
    } else {
      // Select new category
      params.set('category', categorySlug)
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const toggleArrayFilter = (key: 'categories' | 'healthVerticals', value: string) => {
    if (key === 'categories') {
      handleCategoryChange(value)
      return
    }
    
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      healthVerticals: [],
      priceRange: { min: null, max: null },
      inStockOnly: false
    })
    
    // Clear URL category
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    router.push(`/products?${params.toString()}`)
  }

  const hasActiveFilters = 
    currentCategory ||
    filters.healthVerticals.length > 0 ||
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null ||
    filters.inStockOnly

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="px-4 py-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="flex flex-wrap gap-1">
              {currentCategory && (
                <Badge variant="secondary" className="text-xs">
                  {categories.find(cat => cat.toLowerCase().replace(/\s+/g, '-') === currentCategory) || currentCategory}
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString())
                      params.delete('category')
                      router.push(`/products?${params.toString()}`)
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              {filters.healthVerticals.map(vertical => (
                <Badge key={vertical} variant="secondary" className="text-xs">
                  {vertical}
                  <button 
                    onClick={() => toggleArrayFilter('healthVerticals', vertical)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="px-4 py-3 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {categories.map(category => {
              const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
              const isSelected = currentCategory === categorySlug
              
              return (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={isSelected}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Health Verticals - Commented out for now */}
      {/* {healthVerticals.length > 0 && (
        <Card>
          <CardHeader className="px-4 py-3 pb-2">
            <CardTitle className="text-sm font-medium">Treatment Area</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {healthVerticals.map(vertical => (
              <div key={vertical} className="flex items-center space-x-2">
                <Checkbox
                  id={`vertical-${vertical}`}
                  checked={filters.healthVerticals.includes(vertical)}
                  onCheckedChange={() => toggleArrayFilter('healthVerticals', vertical)}
                />
                <Label
                  htmlFor={`vertical-${vertical}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {vertical}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )} */}

      {/* Stock Status - Commented out for now */}
      {/* <Card>
        <CardHeader className="px-4 py-3 pb-2">
          <CardTitle className="text-sm font-medium">Availability</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock-only"
              checked={filters.inStockOnly}
              onCheckedChange={(checked) => updateFilter('inStockOnly', checked)}
            />
            <Label
              htmlFor="in-stock-only"
              className="text-sm font-normal cursor-pointer"
            >
              In Stock Only
            </Label>
          </div>
        </CardContent>
      </Card> */}

    </div>
  )
}