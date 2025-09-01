"use client"

import { Suspense, use } from "react"
import { ProductsListing } from "@/components/products/products-listing"
import { ProductsHeader } from "@/components/products/products-header"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    recommended?: string
    from?: string
  }>
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = use(searchParams)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation Header */}
      <Header variant="light" />
      
      {/* Products Page Header */}
      <div className="pt-20">
        <ProductsHeader 
          category={params.category}
          isRecommended={params.recommended === 'true'}
          fromQuiz={params.from === 'quiz'}
        />
      </div>
      
      {/* Products Listing */}
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      }>
        <ProductsListing 
          categoryFilter={params.category}
          isRecommended={params.recommended === 'true'}
        />
      </Suspense>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}